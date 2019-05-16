import memoize from 'mem'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './base'

export const GRANT_TYPE = 'password'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly username: string
  readonly password: string
  readonly client_secret?: string
  readonly scope?: string
}

const castToTokenRequestParams = (
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
    return !!castToTokenRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = memoize(
  async (oauthTokenRequest: TokenRequester, params: IndexSignature) => {
    const { oauthUrl } = params

    return oauthTokenRequest(
      `${oauthUrl}/oauth/token`,
      castToTokenRequestParams(params),
    )
  },
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, params: IndexSignature) =>
      JSON.stringify(castToTokenRequestParams(params)),
  },
)
