import memoize from 'mem'
import querystring from 'query-string'
import {
  authorizationCodeGrant,
  IAuthorizationResponse,
  passwordGrant,
  refreshTokenGrant,
} from '../oauth'
import makeLogger from '../utils/logger'
import oauthTokenRequest from './oauthTokenRequest'
import { IAllthingsRestClientOptions } from './types'

const logger = makeLogger('OAuth Request')

const MEMOIZE_OPTIONS = { cachePromiseRejection: false, maxAge: 3600 * 1000 }

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    clientOptions: IAllthingsRestClientOptions,
  ): Promise<IAuthorizationResponse | undefined> => {
    const {
      oauthUrl,
      username,
      password,
      scope,
      clientId,
      clientSecret,
    } = clientOptions

    // tslint:disable-next-line:no-expression-statement
    logger.log('Performing password grant flow')

    if (!clientId) {
      throw new Error(
        'Missing required "clientId" parameter to perform authorization code grant',
      )
    }

    if (!username) {
      throw new Error(
        'Missing required "username" parameter to perform password grant',
      )
    }

    if (!password) {
      throw new Error(
        'Missing required "password" parameter to perform password grant',
      )
    }

    return passwordGrant.requestToken(
      oauthTokenRequest,
      `${oauthUrl}/oauth/token`,
      {
        client_id: clientId,
        grant_type: passwordGrant.GRANT_TYPE,
        password,
        scope,
        username,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      },
    )
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

  const {
    authCode,
    authorizationRedirect,
    clientId,
    clientSecret,
    oauthUrl,
    redirectUri,
    scope,
    state,
  } = clientOptions

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform authorization code grant',
    )
  }

  if (!redirectUri) {
    throw new Error(
      'Missing required "redirectUri" parameter to perform authorization code grant',
    )
  }

  if (!authCode) {
    const redirectUrlParams = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: authorizationCodeGrant.RESPONSE_TYPE,
      scope,
      state,
    }

    if (typeof authorizationRedirect === 'function') {
      return authorizationRedirect(
        `${oauthUrl}/oauth/authorize?${querystring.stringify(
          redirectUrlParams,
        )}`,
      )
    }

    throw new Error(
      'Could not perform authorization code grant: provide either "authCode" ' +
        'or "authorizationRedirect" parameter',
    )
  }

  return authorizationCodeGrant.requestToken(
    oauthTokenRequest,
    `${oauthUrl}/oauth/token`,
    {
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: authorizationCodeGrant.GRANT_TYPE,
      redirect_uri: redirectUri,
    },
  )
}

export const getNewTokenUsingAuthorizationGrant = memoize(
  unmemoizedGetNewTokenUsingAuthorizationGrant,
  MEMOIZE_OPTIONS,
)

export const unmemoizedGetNewTokenUsingRefreshToken = async (
  clientOptions: IAllthingsRestClientOptions,
): Promise<IAuthorizationResponse> => {
  const {
    oauthUrl,
    refreshToken,
    scope,
    clientId,
    clientSecret,
  } = clientOptions

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform refresh token grant',
    )
  }

  if (!refreshToken) {
    throw new Error(
      'Missing required "refreshToken" parameter to perform refresh token grant',
    )
  }

  // tslint:disable-next-line:no-expression-statement
  logger.log('Performing refresh flow')

  return refreshTokenGrant.requestToken(
    oauthTokenRequest,
    `${oauthUrl}/oauth/token`,
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: refreshTokenGrant.GRANT_TYPE,
      refresh_token: refreshToken,
      scope,
    },
  )
}

export const getNewTokenUsingRefreshToken = memoize(
  unmemoizedGetNewTokenUsingRefreshToken,
  MEMOIZE_OPTIONS,
)
