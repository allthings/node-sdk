import querystring from 'query-string'

export const RESPONSE_TYPE = 'token'

export interface IAuthorizationRequestParams {
  readonly client_id: string
  readonly redirect_uri: string
  readonly response_type: string
  readonly scope?: string
  readonly state?: string
}

const castClientOptionsToRedirectParams = (
  clientOptions: IndexSignature,
): IAuthorizationRequestParams => {
  const { clientId, scope, state, redirectUri } = clientOptions

  if (!clientId) {
    throw new Error(
      'Missing required "clientId" parameter to perform implicit grant',
    )
  }

  return {
    client_id: clientId,
    redirect_uri: redirectUri || window.location.href,
    response_type: RESPONSE_TYPE,
    ...(scope ? { scope } : {}),
    ...(state ? { state } : {}),
  }
}

export const isEligibleForClientRedirect = (
  clientOptions: IndexSignature,
): boolean => {
  try {
    return castClientOptionsToRedirectParams(clientOptions) && true
  } catch {
    return false
  }
}

export const getRedirectUrl = (clientOptions: IndexSignature) =>
  `${clientOptions.oauthUrl}/oauth/authorize?${querystring.stringify(
    castClientOptionsToRedirectParams(clientOptions),
  )}`
