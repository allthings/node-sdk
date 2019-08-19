import querystring from 'query-string'

export const RESPONSE_TYPE = 'token'

const castToAuthorizationRequestParams = (params: IndexSignature) => {
  const { clientId, scope, state, redirectUri } = params

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
  params: IndexSignature,
): boolean => {
  try {
    return !!castToAuthorizationRequestParams(params)
  } catch {
    return false
  }
}

export const getRedirectUrl = (params: IndexSignature) =>
  `${params.oauthUrl}/oauth/authorize?${querystring.stringify(
    castToAuthorizationRequestParams(params),
  )}`
