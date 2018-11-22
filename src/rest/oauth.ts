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

const makeTokenRequest = async (
  clientOptions: IAllthingsRestClientOptions,
  grantType: string,
  authCode?: string,
): Promise<IAuthorizationResponse> => {
  const {
    clientId,
    clientSecret,
    oauthUrl,
    password,
    redirectUri,
    refreshToken,
    scope,
    username,
  } = clientOptions

  const url = `${oauthUrl}/oauth/token`

  try {
    const response = await fetch(url, {
      body: querystring.stringify({
        ...(authCode && { code: authCode }),
        client_id: clientId,
        ...(clientSecret && { client_secret: clientSecret }),
        grant_type: grantType,
        ...(password && { password }),
        ...(refreshToken && { refresh_token: refreshToken }),
        ...(redirectUri && { redirect_uri: redirectUri }),
        ...(scope && { scope }),
        ...(username && { username }),
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
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    } = await response.json()

    if (response.status !== 200) {
      throw response
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
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

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    clientOptions: IAllthingsRestClientOptions,
  ): Promise<IAuthorizationResponse | undefined> => {
    // tslint:disable-next-line:no-expression-statement
    logger.log('Performing password grant flow')

    return makeTokenRequest(clientOptions, 'password')
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

  const { clientId, oauthUrl, scope } = clientOptions
  const { code: authCode } = querystring.parse(window.location.search)
  // snip the code from the url
  // tslint:disable-next-line:no-expression-statement
  window.history.replaceState({}, '', window.location.href.split('?')[0])
  const redirectUri = clientOptions.redirectUri || window.location.href

  const allthingsAuthUrl = `${oauthUrl}/oauth/authorize?${querystring.stringify(
    {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state: 'Nativeapp',
    },
  )}`

  if (typeof authCode !== 'string') {
    // tslint:disable-next-line:no-expression-statement no-object-mutation
    window.location.href = allthingsAuthUrl

    return undefined
  }

  return makeTokenRequest(
    { ...clientOptions, redirectUri },
    'authorization_code',
    authCode,
  )
}

export const getNewTokenUsingAuthorizationGrant = memoize(
  unmemoizedGetNewTokenUsingAuthorizationGrant,
  MEMOIZE_OPTIONS,
)

export const unmemoizedGetNewTokenUsingRefreshToken = async (
  clientOptions: IAllthingsRestClientOptions,
): Promise<IAuthorizationResponse> => {
  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing refresh flow')

  return makeTokenRequest(clientOptions, 'refresh_token')
}

export const getNewTokenUsingRefreshToken = memoize(
  unmemoizedGetNewTokenUsingRefreshToken,
  MEMOIZE_OPTIONS,
)
