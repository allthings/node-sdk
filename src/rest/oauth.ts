import fetch from 'cross-fetch'
import memoize from 'mem'
import querystring from 'query-string'
import { USER_AGENT } from '../constants'
import makeLogger from '../utils/logger'
import { IAllthingsRestClientOptions } from './types'

const logger = makeLogger('OAuth Request')

const MEMOIZE_OPTIONS = { cachePromiseRejection: false, maxAge: 3600 * 1000 }

export interface IAuthorizationResponse {
  readonly accessToken: string
  readonly refreshToken?: string
}

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    clientOptions: IAllthingsRestClientOptions,
  ): Promise<IAuthorizationResponse | undefined> => {
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

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
      } = await response.json()

      if (response.status !== 200) {
        throw response
      }

      return { accessToken, refreshToken }
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
  clientOptions: IAllthingsRestClientOptions,
): Promise<IAuthorizationResponse | undefined> => {
  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing implicit grant flow')

  const { clientId, oauthUrl, scope, state } = clientOptions

  const redirectUri = clientOptions.redirectUri || window.location
  const payload = querystring.parse(window.location.hash)
  const accessToken = payload && (payload.access_token as string)

  const allthingsAuthUrl = `${oauthUrl}/oauth/authorize?${querystring.stringify(
    {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope,
      state,
    },
  )}`

  if (!accessToken) {
    // tslint:disable-next-line:no-expression-statement no-object-mutation
    window.location.href = allthingsAuthUrl

    return undefined
  }

  // tslint:disable-next-line:no-expression-statement
  window.history.replaceState({}, '', window.location.href.split('#')[0])

  return { accessToken }
}

export const getNewTokenUsingImplicitFlow = memoize(
  unmemoizedGetNewTokenUsingImplicitFlow,
  MEMOIZE_OPTIONS,
)

export const unmemoizedGetNewTokenUsingAuthorizationGrant = async (
  clientOptions: IAllthingsRestClientOptions,
): Promise<IAuthorizationResponse | undefined> => {
  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing auth grant flow')

  const { clientId, clientSecret, oauthUrl, scope } = clientOptions

  const { code: authCode } = querystring.parse(window.location.search)
  const redirectUri = clientOptions.redirectUri || window.location

  const allthingsAuthUrl = `${oauthUrl}/oauth/authorize?${querystring.stringify(
    {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state: 'Nativeapp',
    },
  )}`

  if (!authCode) {
    // tslint:disable-next-line:no-expression-statement no-object-mutation
    window.location.href = allthingsAuthUrl

    return undefined
  }

  const url = `${oauthUrl}/oauth/token`

  try {
    // tslint:disable-next-line:no-expression-statement
    window.history.replaceState({}, '', window.location.href.split('?')[0])
    const response = await fetch(url, {
      body: querystring.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'http://0.0.0.0:3333/test/fixtures/implicit-flow',
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

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
    } = await response.json()

    if (response.status !== 200) {
      throw response
    }

    return { accessToken, refreshToken }
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
}

export const getNewTokenUsingAuthorizationGrant = memoize(
  unmemoizedGetNewTokenUsingAuthorizationGrant,
  MEMOIZE_OPTIONS,
)

export const unmemoizedGetNewTokenUsingRefreshToken = async (
  clientOptions: IAllthingsRestClientOptions,
): Promise<IAuthorizationResponse | undefined> => {
  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing refresh flow')

  const { clientId, clientSecret, scope } = clientOptions

  try {
    const url = 'https://accounts.dev.allthings.me/oauth/token'

    const response = await fetch(url, {
      body: querystring.stringify({
        client_id: clientId,
        ...(clientSecret && { client_secret: clientSecret }),
        grant_type: 'refresh_token',
        refresh_token: clientOptions.refreshToken,
        scope,
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

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
    } = await response.json()

    if (response.status !== 200) {
      throw response
    }

    return { accessToken, refreshToken }
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
}

export const getNewTokenUsingRefreshToken = memoize(
  unmemoizedGetNewTokenUsingRefreshToken,
  MEMOIZE_OPTIONS,
)
