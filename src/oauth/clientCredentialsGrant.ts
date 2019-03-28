import memoize from 'mem'

import { TokenRequester } from '.'
import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'

export const GRANT_TYPE = 'client-credentials'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly client_secret: string
  readonly scope: string
}

const castClientOptionsToRequestParams = (
  clientOptions: IndexSignature,
): IAccessTokenRequestParams => {
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

  if (!scope) {
    throw new Error(
      'Missing required "scope" parameter to perform client credentials grant',
    )
  }

  return {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: GRANT_TYPE,
    scope,
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
