import { TokenRequester } from './types'

export const GRANT_TYPE = 'password'

const castToTokenRequestParams = (params: Record<string, any>) => {
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

export const isEligible = (params: Record<string, any>): boolean => {
  try {
    return !!castToTokenRequestParams(params)
  } catch {
    return false
  }
}

export const requestToken = (
  tokenRequester: TokenRequester,
  params: Record<string, any>,
) => tokenRequester(castToTokenRequestParams(params))
