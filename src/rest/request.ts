import Bottleneck from 'bottleneck'
import fetch from 'cross-fetch'
import FormDataModule from 'form-data'
import querystring from 'query-string'
import {
  QUEUE_CONCURRENCY,
  QUEUE_DELAY,
  QUEUE_RESERVOIR,
  QUEUE_RESERVOIR_REFILL_INTERVAL,
  USER_AGENT,
} from '../constants'
import maybeUpdateToken from '../oauth/maybeUpdateToken'
import { ITokenStore, TokenRequester } from '../oauth/types'
import { fnClearInterval, until } from '../utils/functional'
import makeLogger from '../utils/logger'
import sleep from '../utils/sleep'
import { IAllthingsRestClientOptions } from './types'

const requestLogger = makeLogger('REST API Request')
const responseLogger = makeLogger('REST API Response')

interface IFormOptions {
  readonly [key: string]: ReadonlyArray<any>
}

interface IBodyFormData {
  readonly formData: IFormOptions
}

interface IBody {
  readonly [key: string]: any
}

export interface IRequestOptions {
  readonly body?: IBodyFormData | IBody
  readonly headers?: { readonly [key: string]: string }
  readonly query?: { readonly [parameter: string]: string }
}

export type RequestResult = Promise<any>

export type HttpVerb = 'delete' | 'get' | 'head' | 'patch' | 'post' | 'put'

export type MethodHttpRequest = (
  httpMethod: string,
  apiMethod: string,
  payload?: IRequestOptions,
  returnRawResultObject?: boolean,
) => RequestResult

const RETRYABLE_STATUS_CODES: ReadonlyArray<number> = [
  401,
  408,
  429,
  502,
  503,
  504,
]

const TOKEN_REFRESH_STATUS_CODES: ReadonlyArray<number> = [401]

const queue = new Bottleneck({
  maxConcurrent: QUEUE_CONCURRENCY,
  minTime: QUEUE_DELAY,
  reservoir: QUEUE_RESERVOIR,
})

export type IntervalSet = Set<NodeJS.Timer>

const refillIntervalSet: IntervalSet = new Set()

function isFormData(
  body: IBodyFormData | IBody | undefined,
): body is IBodyFormData {
  return typeof body !== 'undefined' && body.formData !== undefined
}

/**
 * refillReservoir() refills the queue's reservoir
 * at a rate of 1 every QUEUE_RESERVOIR_REFILL_INTERVAL
 * Caution: if the job's weight is greater than 1, it's possible that the
 * reservoir never gets depleted, but the job with weight 2 never runs.
 * Effectively, only weight of 1 is supported.
 */
function refillReservoir(): IntervalSet {
  if (refillIntervalSet.size === 0) {
    const interval: NodeJS.Timer = setInterval(async () => {
      const reservoir = (await queue.currentReservoir()) as number

      if (queue.empty() && (await queue.running()) === 0 && reservoir > 10) {
        return (
          queue.incrementReservoir(1) &&
          fnClearInterval(interval) &&
          refillIntervalSet.delete(interval)
        )
      }

      return reservoir < QUEUE_RESERVOIR
        ? queue.incrementReservoir(1)
        : fnClearInterval(interval) && refillIntervalSet.delete(interval)
    }, QUEUE_RESERVOIR_REFILL_INTERVAL)

    return refillIntervalSet.add(interval)
  }

  return refillIntervalSet
}

async function makeResultFromResponse(
  response: Response,
): Promise<Error | { readonly status: number; readonly body: any }> {
  // E.g. retry 503s as it was likely a rate-limited request
  if (RETRYABLE_STATUS_CODES.includes(response.status)) {
    return response.clone()
  }

  if (!response.ok) {
    return new Error(
      `${response.status} ${response.statusText}\n\n${await response.text()}`,
    )
  }

  // The API only returns JSON, so if it's something else there was
  // probably an error.
  if (
    response.headers.get('content-type') !== 'application/json' &&
    response.status !== 204
  ) {
    return new Error(
      `Response content type was "${response.headers.get(
        'content-type',
      )}" but expected JSON`,
    )
  }

  return {
    body: response.status === 204 ? '' : await response.json(),
    status: response.status,
  }
}

/**
 * Determine if the result was successful. Here, successful means
 * a non-retryable code (e.g. not 429, or 502-504 error).
 */
export function responseWasSuccessful(response: Response): boolean {
  return !RETRYABLE_STATUS_CODES.includes(response.status)
}

/**
 * Perform an API request. The request is passed to the queue from where it is
 * queued and scheduled for execution. When a request fails with a retryable
 * statusCode, the request is retried up to REQUEST_MAX_RETRIES times. Retries
 * are implemented with exponential-backing off strategy with jitter.
 */
export function makeApiRequest(
  oauthTokenStore: ITokenStore,
  oauthTokenRequester: TokenRequester,
  options: IAllthingsRestClientOptions,
  httpMethod: HttpVerb,
  apiMethod: string,
  payload?: IRequestOptions,
  returnRawResultObject?: boolean,
): (previousResult: any, iteration: number) => Promise<Response> {
  return async (previousResult, retryCount) => {
    if (retryCount > 0) {
      if (retryCount > options.requestMaxRetries) {
        const error = `Maximum number of retries reached while retrying ${previousResult.method} request ${previousResult.path}.`

        // tslint:disable-next-line:no-expression-statement
        requestLogger.error(error)

        throw new Error(error)
      }

      // tslint:disable-next-line:no-expression-statement
      requestLogger.warn(
        `Warning: encountered ${previousResult.status}. Retrying ${previousResult.method} request ${previousResult.path} (retry #${retryCount}).`,
      )

      // disabling linter here for better readabiliy
      // tslint:disable-next-line:no-expression-statement
      await sleep(
        Math.ceil(
          Math.random() * // adds jitter
            options.requestBackOffInterval *
            2 ** retryCount, // exponential backoff
        ),
      )
    }

    // tslint:disable-next-line:no-expression-statement
    await maybeUpdateToken(
      oauthTokenStore,
      oauthTokenRequester,
      options,
      retryCount > 0 &&
        TOKEN_REFRESH_STATUS_CODES.includes(previousResult.status),
    )

    if (!oauthTokenStore.get('accessToken')) {
      throw new Error('Unable to get OAuth2 access token.')
    }

    try {
      return (
        refillReservoir() &&
        (await queue.schedule(async () => {
          const method = httpMethod.toUpperCase()
          const payloadQuery =
            payload && payload.query
              ? (apiMethod.includes('?') ? '&' : '?') +
                querystring.stringify(payload.query)
              : ''
          const url = `${options.apiUrl}/api${apiMethod}${payloadQuery}`
          const body = payload && payload.body
          const hasForm = isFormData(body)
          const form = isFormData(body) ? body.formData : {}
          const formData = Object.entries(form).reduce(
            (previous, [name, value]) => {
              // tslint:disable-next-line
              previous.append.apply(previous, [name].concat(value))

              return previous
            },
            new FormDataModule(),
          )

          const headers = {
            accept: 'application/json',
            authorization: `Bearer ${oauthTokenStore.get('accessToken')}`,
            ...(!hasForm ? { 'content-type': 'application/json' } : {}),

            // don't use unsafe header "user-agent" in browser
            ...(typeof window === 'undefined' && { 'user-agent': USER_AGENT }),

            // user overrides
            ...(payload && payload.headers ? payload.headers : {}),

            // content-type header overrides given FormData
            ...(hasForm && formData.getHeaders ? formData.getHeaders() : {}),
          }

          // Log the request including raw body
          // tslint:disable-next-line:no-expression-statement
          requestLogger.log(method, url, {
            body,
            headers,
          })

          const requestBody = {
            // "form-data" module is missing some methods to be compliant with
            // w3c FormData spec, however it works fine here.
            body: hasForm ? (formData as any) : JSON.stringify(body),
          }

          const response = await fetch(url, {
            cache: 'no-cache',
            credentials: 'omit',

            headers,
            method,
            mode: 'cors',

            ...(hasForm || body ? requestBody : {}),
          })

          const result = await makeResultFromResponse(response)

          // Log the response
          // tslint:disable-next-line:no-expression-statement
          responseLogger.log(
            method,
            url,
            result instanceof Error
              ? { error: result }
              : {
                  body: result.body,
                  status: response.status,
                },
          )

          return result instanceof Error && returnRawResultObject
            ? {
                body: result.message,
                status: response.status,
              }
            : result
        }))
      )
    } catch (error) {
      return error
    }
  }
}

/**
 * Perform a request. If an access token is not provided, or has not previously been
 * fetched, a new one will be retrieved from the Accounts OAuth token service. The token
 * is reused on subsequent requests.
 */
export default async function request(
  oauthTokenStore: ITokenStore,
  oauthTokenRequester: TokenRequester,
  options: IAllthingsRestClientOptions,
  httpMethod: HttpVerb,
  apiMethod: string,
  payload?: IRequestOptions,
  returnRawResultObject?: boolean,
): RequestResult {
  /*
    Make the API request. If the response was a 503, we retry the request
    while backing off exponentially +REQUEST_BACK_OFF_INTERVAL milliseconds
    on each retry until we reach REQUEST_MAX_RETRIES at which point throw an error.
  */

  const result = await until(
    responseWasSuccessful,
    makeApiRequest(
      oauthTokenStore,
      oauthTokenRequester,
      options,
      httpMethod,
      apiMethod,
      payload,
      returnRawResultObject,
    ),
  )

  if (result instanceof Error) {
    // tslint:disable-next-line:no-expression-statement
    requestLogger.log('Request Error', result, payload)

    throw result
  }

  return returnRawResultObject ? result : result.body
}
