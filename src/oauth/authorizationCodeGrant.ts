import memoize from 'mem'
import querystring from 'query-string'

import { TokenRequester } from '.'
import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'

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

const castClientOptionsToRedirectParams = (
  clientOptions: IndexSignature,
): IAuthorizationRequestParams => {
  const { redirectUri, clientId, scope, state } = clientOptions

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
  clientOptions: IndexSignature,
): boolean => {
  try {
    return castClientOptionsToRedirectParams(clientOptions) && true
  } catch {
    return false
  }
}

export const getRedirectUrl = (clientOptions: IndexSignature) =>
  `${clientOptions.oauthUrl}/oauth/authorize?${querystring.stringify(
    castClientOptionsToRedirectParams(clientOptions),
  )}`

const castClientOptionsToRequestParams = (
  clientOptions: IndexSignature,
): IAccessTokenRequestParams => {
  const { authCode, redirectUri, clientId, clientSecret } = clientOptions

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

export const isEligible = (clientOptions: IndexSignature): boolean => {
  try {
    return castClientOptionsToRequestParams(clientOptions) && true
  } catch {
    return false
  }
}

export const getTokenFromClientOptions = memoize(
  async (oauthTokenRequest: TokenRequester, clientOptions: IndexSignature) => {
    const { oauthUrl } = clientOptions

    return oauthTokenRequest(
      `${oauthUrl}/oauth/token`,
      castClientOptionsToRequestParams(clientOptions),
    )
  },
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, clientOptions: IndexSignature) =>
      JSON.stringify(castClientOptionsToRequestParams(clientOptions)),
  },
)
