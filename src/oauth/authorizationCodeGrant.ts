import querystring from 'query-string'

import { TokenRequester } from './types'

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
  const { authorizationCode, redirectUri, clientId, clientSecret } = params

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

  if (!authorizationCode) {
    throw new Error(
      'Missing required "authorizationCode" parameter to perform authorization code grant',
    )
  }

  return {
    client_id: clientId,
    code: authorizationCode,
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

export const requestToken = (
  tokenRequester: TokenRequester,
  params: IndexSignature,
) => tokenRequester(castToTokenRequestParams(params))
