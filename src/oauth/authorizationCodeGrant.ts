import memoize from 'mem'
import querystring from 'query-string'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './base'

export const RESPONSE_TYPE = 'code'
export const GRANT_TYPE = 'authorization_code'

const castToAuthorizationRequestParams = (params: IndexSignature) => {
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

const castToTokenRequestParams = (params: IndexSignature) => {
  const { authenticationCode, redirectUri, clientId, clientSecret } = params

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

  if (!authenticationCode) {
    throw new Error(
      'Missing required "authenticationCode" parameter to perform authorization code grant',
    )
  }

  return {
    client_id: clientId,
    code: authenticationCode,
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
  async (tokenRequester: TokenRequester, params: IndexSignature) =>
    tokenRequester(castToTokenRequestParams(params)),
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, params: IndexSignature) =>
      JSON.stringify(castToTokenRequestParams(params)),
  },
)