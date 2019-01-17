import memoize from 'mem'

import { COMMON_MEMOIZE_OPTIONS, TokenRequester } from '.'

export const GRANT_TYPE = 'refresh_token'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly refresh_token: string
  readonly client_secret?: string
  readonly scope?: string
}

const castClientOptionsToRequestParams = (
  clientOptions: IndexSignature,
): IAccessTokenRequestParams => {
  const { clientId, clientSecret, refreshToken, scope } = clientOptions

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
    ...COMMON_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, clientOptions: IndexSignature) =>
      JSON.stringify(castClientOptionsToRequestParams(clientOptions)),
  },
)
