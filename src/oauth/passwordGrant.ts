import memoize from 'mem'

import { TokenRequester } from '.'
import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'

export const GRANT_TYPE = 'password'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly username: string
  readonly password: string
  readonly client_secret?: string
  readonly scope?: string
}

const castToRequestParams = (
  params: IndexSignature,
): IAccessTokenRequestParams => {
  const { username, password, scope, clientId, clientSecret } = params

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform password grant',
    )
  }

  if (!username) {
    throw new Error(
      'Missing required "username" parameter to perform password grant',
    )
  }

  if (!password) {
    throw new Error(
      'Missing required "password" parameter to perform password grant',
    )
  }

  return {
    client_id: clientId,
    grant_type: GRANT_TYPE,
    password,
    username,
    ...(scope ? { scope } : {}),
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  }
}

export const isEligible = (params: IndexSignature): boolean => {
  try {
    return !!castToRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = memoize(
  async (oauthTokenRequest: TokenRequester, params: IndexSignature) => {
    const { oauthUrl } = params

    return oauthTokenRequest(
      `${oauthUrl}/oauth/token`,
      castToRequestParams(params),
    )
  },
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, params: IndexSignature) =>
      JSON.stringify(castToRequestParams(params)),
  },
)
