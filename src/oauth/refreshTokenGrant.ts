import memoize from 'mem'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './base'

export const GRANT_TYPE = 'refresh_token'

const castToTokenRequestParams = (params: IndexSignature) => {
  const { clientId, clientSecret, refreshToken, scope } = params

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

  return {
    client_id: clientId,
    grant_type: GRANT_TYPE,
    refresh_token: refreshToken,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
    ...(scope ? { scope } : {}),
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
