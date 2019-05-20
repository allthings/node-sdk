import querystring from 'query-string'

import * as authorizationCodeGrant from '../oauth/authorizationCodeGrant'
import { IAuthorizationResponse, TokenRequester } from '../oauth/base'
import * as implicitGrant from '../oauth/implicitGrant'
import * as passwordGrant from '../oauth/passwordGrant'
import * as refreshTokenGrant from '../oauth/refreshTokenGrant'

export default async function oauthGetTokenFromOptions(
  tokenFetcher: TokenRequester,
  options: IndexSignature,
  mustRefresh = false,
): Promise<IAuthorizationResponse | undefined> {
  if (mustRefresh && refreshTokenGrant.isEligible(options)) {
    return refreshTokenGrant.requestToken(tokenFetcher, options)
  }

  if (options.accessToken) {
    return {
      accessToken: options.accessToken,
      refreshToken: options.refreshToken,
    }
  }

  if (passwordGrant.isEligible(options)) {
    return passwordGrant.requestToken(tokenFetcher, options)
  }

  if (typeof window !== 'undefined' && options.implicit) {
    const parsedLocationHash = querystring.parse(window.location.hash)
    const accessToken =
      parsedLocationHash && (parsedLocationHash.access_token as string)

    if (accessToken) {
      // tslint:disable-next-line:no-expression-statement
      window.history.replaceState({}, '', window.location.href.split('#')[0])

      return { accessToken }
    }

    if (implicitGrant.isEligibleForClientRedirect(options)) {
      // tslint:disable-next-line:no-expression-statement no-object-mutation
      window.location.href = implicitGrant.getRedirectUrl(options)

      return
    }
  }

  if (authorizationCodeGrant.isEligible(options)) {
    return authorizationCodeGrant.requestToken(tokenFetcher, options)
  }

  if (
    options.authorizationRedirect &&
    authorizationCodeGrant.isEligibleForClientRedirect(options)
  ) {
    return options.authorizationRedirect(
      authorizationCodeGrant.getRedirectUrl(options),
    )
  }

  return
}
