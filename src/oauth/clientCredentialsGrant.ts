import { TokenRequester } from './types'

export const GRANT_TYPE = 'client_credentials'

const castClientOptionsToRequestParams = (
  clientOptions: Record<string, any>,
) => {
  const { scope, clientId, clientSecret } = clientOptions

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform client credentials grant',
    )
  }

  if (!clientSecret) {
    throw new Error(
      'Missing required "clientSecret" parameter to perform client credentials grant',
    )
  }

  return {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: GRANT_TYPE,
    ...(scope ? { scope } : {}),
  }
}

export const isEligible = (clientOptions: Record<string, any>): boolean => {
  try {
    return !!castClientOptionsToRequestParams(clientOptions)
  } catch {
    return false
  }
}

export const requestToken = (
  oauthTokenRequest: TokenRequester,
  clientOptions: Record<string, any>,
) => oauthTokenRequest(castClientOptionsToRequestParams(clientOptions))
