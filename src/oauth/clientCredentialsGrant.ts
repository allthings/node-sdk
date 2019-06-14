import memoize from 'mem'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './base'

export const GRANT_TYPE = 'client_credentials'

const castClientOptionsToRequestParams = (clientOptions: IndexSignature) => {
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

export const isEligible = (clientOptions: IndexSignature): boolean => {
  try {
    return !!castClientOptionsToRequestParams(clientOptions)
  } catch {
    return false
  }
}

export const getTokenFromClientOptions = memoize(
  async (oauthTokenRequest: TokenRequester, clientOptions: IndexSignature) =>
    oauthTokenRequest(castClientOptionsToRequestParams(clientOptions)),
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, clientOptions: IndexSignature) =>
      JSON.stringify(castClientOptionsToRequestParams(clientOptions)),
  },
)
