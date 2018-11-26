import fetch from 'cross-fetch'
import memoize from 'mem'
import querystring from 'query-string'
import { USER_AGENT } from '../constants'
import makeLogger from '../utils/logger'
import { InterfaceAllthingsRestClientOptions } from './types'

const logger = makeLogger('OAuth Request')

const MEMOIZE_OPTIONS = { cachePromiseRejection: false, maxAge: 3600 * 1000 }

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    clientOptions: InterfaceAllthingsRestClientOptions,
  ): Promise<string | undefined> => {
    // tslint:disable-next-line:no-expression-statement
    logger.log('Performing password grant flow')

    const {
      clientId,
      clientSecret,
      oauthUrl,
      password,
      scope,
      username,
    } = clientOptions

    const url = `${oauthUrl}/oauth/token`

    try {
      const response = await fetch(url, {
        body: querystring.stringify({
          client_id: clientId,
          ...(clientSecret ? { client_secret: clientSecret } : {}),
          grant_type: 'password',
          password,
          scope,
          username,
        }),
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          // OAuth 2 requires request content-type to be
          // application/x-www-form-urlencoded
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
          'user-agent': USER_AGENT,
        },
        method: 'POST',
        mode: 'cors',
      })

      const data = await response.json()

      if (response.status !== 200) {
        throw response
      }

      return data.access_token
    } catch (error) {
      if (!error.status) {
        throw error
      }

      const errorName = `HTTP ${error.status} — ${error.statusText}`

      // tslint:disable-next-line:no-expression-statement
      logger.error(errorName, error.response)

      throw new Error(
        `HTTP ${error.status} — ${error.statusText}. Could not get token.`,
      )
    }
  },
  MEMOIZE_OPTIONS,
)

export const unmemoizedGetNewTokenUsingImplicitFlow = async (
  clientOptions: InterfaceAllthingsRestClientOptions,
): Promise<string | undefined> => {
  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing implicit grant flow')

  const redirectUri = clientOptions.redirectUri || window.location
  const payload = querystring.parse(window.location.hash)
  const accessToken = payload && (payload.access_token as string)

  const oauthUrl = `${
    clientOptions.oauthUrl
  }/oauth/authorize?${querystring.stringify({
    client_id: clientOptions.clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: clientOptions.scope,
    state: clientOptions.state,
  })}`

  if (!accessToken) {
    // tslint:disable-next-line:no-expression-statement no-object-mutation
    window.location.href = oauthUrl

    return undefined
  }

  // tslint:disable-next-line:no-expression-statement
  window.history.replaceState({}, '', window.location.href.split('#')[0])

  return accessToken
}

export const getNewTokenUsingImplicitFlow = memoize(
  unmemoizedGetNewTokenUsingImplicitFlow,
  MEMOIZE_OPTIONS,
)
