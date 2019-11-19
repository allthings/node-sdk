import { TokenRequester } from './types'

export const GRANT_TYPE = 'refresh_token'

const castToTokenRequestParams = (params: IDictionary) => {
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

export const isEligible = (params: IDictionary): boolean => {
  try {
    return !!castToTokenRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = (
  tokenRequester: TokenRequester,
  params: IDictionary,
) => tokenRequester(castToTokenRequestParams(params))
