import memoize from 'mem'
import querystring from 'query-string'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './base'

export const RESPONSE_TYPE = 'code'
export const GRANT_TYPE = 'authorization_code'

export interface IAuthorizationRequestParams {
  readonly client_id: string
  readonly response_type: string
  readonly redirect_uri: string
  readonly scope?: string
  readonly state?: string
}

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly code: string
  readonly grant_type: string
  readonly redirect_uri: string
  readonly client_secret?: string
}

const castToAuthorizationRequestParams = (
  params: IndexSignature,
): IAuthorizationRequestParams => {
  const { redirectUri, clientId, scope, state } = params

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform authorization code grant redirect',
    )
  }

  if (!redirectUri) {
    throw new Error(
      'Missing required "redirectUri" parameter to perform authorization code grant redirect',
    )
  }

  return {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: RESPONSE_TYPE,
    ...(scope ? { scope } : {}),
    ...(state ? { state } : {}),
  }
}

export const isEligibleForClientRedirect = (
  params: IndexSignature,
): boolean => {
  try {
    return !!castToAuthorizationRequestParams(params)
  } catch {
    return false
  }
}

export const getRedirectUrl = (params: IndexSignature) =>
  `${params.oauthUrl}/oauth/authorize?${querystring.stringify(
    castToAuthorizationRequestParams(params),
  )}`

const castToTokenRequestParams = (
  params: IndexSignature,
): IAccessTokenRequestParams => {
  const { authCode, redirectUri, clientId, clientSecret } = params

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
    throw new Error(
      'Missing required "authCode" parameter to perform authorization code grant',
    )
  }

  return {
    client_id: clientId,
    code: authCode,
    grant_type: GRANT_TYPE,
    redirect_uri: redirectUri,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  }
}

export const isEligible = (params: IndexSignature): boolean => {
  try {
    return !!castToTokenRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = memoize(
  async (tokenRequester: TokenRequester, params: IndexSignature) => {
    const { oauthUrl } = params

    return tokenRequester(
      `${oauthUrl}/oauth/token`,
      castToTokenRequestParams(params),
    )
  },
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, params: IndexSignature) =>
      JSON.stringify(castToTokenRequestParams(params)),
  },
)
