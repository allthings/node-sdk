import querystring from 'query-string'

import { TokenRequester } from './types'

export const RESPONSE_TYPE = 'code'
export const GRANT_TYPE = 'authorization_code'

const castToAuthorizationRequestParams = (params: Record<string, any>) => {
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
  params: Record<string, any>,
): boolean => {
  try {
    return !!castToAuthorizationRequestParams(params)
  } catch {
    return false
  }
}

export const getRedirectUrl = (params: Record<string, any>) =>
  `${params.oauthUrl}/oauth/authorize?${querystring.stringify(
    castToAuthorizationRequestParams(params),
  )}`

const castToTokenRequestParams = (params: Record<string, any>) => {
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

export const isEligible = (params: Record<string, any>): boolean => {
  try {
    return !!castToTokenRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = (
  tokenRequester: TokenRequester,
  params: Record<string, any>,
) => tokenRequester(castToTokenRequestParams(params))
