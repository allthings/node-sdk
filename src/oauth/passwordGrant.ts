import memoize from 'mem'

import { DEFAULT_MEMOIZE_OPTIONS } from '../constants'
import { TokenRequester } from './types'

export const GRANT_TYPE = 'password'

const castToTokenRequestParams = (params: IndexSignature) => {
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
  async (tokenRequester: TokenRequester, params: IndexSignature) =>
    tokenRequester(castToTokenRequestParams(params)),
  {
    ...DEFAULT_MEMOIZE_OPTIONS,
    cacheKey: (_: TokenRequester, params: IndexSignature) =>
      JSON.stringify(castToTokenRequestParams(params)),
  },
)
