import querystring from 'query-string'

import * as authorizationCodeGrant from './authorizationCodeGrant'
import { ITokenStore, TokenRequester } from './base'
import * as clientCredentialsGrant from './clientCredentialsGrant'
import * as implicitGrant from './implicitGrant'
import * as passwordGrant from './passwordGrant'
import * as refreshTokenGrant from './refreshTokenGrant'

export default async function maybeUpdateToken(
  oauthTokenStore: ITokenStore,
  tokenFetcher: TokenRequester,
  options: IndexSignature,
  mustRefresh = false,
): Promise<void> {
  const alreadyHasToken = oauthTokenStore.hasToken()

  const refreshOptions = {
    ...options,
    refreshToken: alreadyHasToken ? oauthTokenStore.get()!.refreshToken : null,
  }

  if (mustRefresh && refreshTokenGrant.isEligible(refreshOptions)) {
    return oauthTokenStore.set(
      await refreshTokenGrant.requestToken(tokenFetcher, refreshOptions),
    )
  }

  if (alreadyHasToken) {
    return
  }

  if (passwordGrant.isEligible(options)) {
    return oauthTokenStore.set(
      await passwordGrant.requestToken(tokenFetcher, options),
    )
  }

  if (typeof window !== 'undefined' && options.implicit) {
    const parsedLocationHash = querystring.parse(window.location.hash)
    const accessToken =
      parsedLocationHash && (parsedLocationHash.access_token as string)

    if (accessToken) {
      // tslint:disable-next-line:no-expression-statement
      window.history.replaceState({}, '', window.location.href.split('#')[0])

      return oauthTokenStore.set({ accessToken })
    }

    if (implicitGrant.isEligibleForClientRedirect(options)) {
      // tslint:disable-next-line:no-expression-statement no-object-mutation
      window.location.href = implicitGrant.getRedirectUrl(options)

      return
    }
  }

  if (authorizationCodeGrant.isEligible(options)) {
    return oauthTokenStore.set(
      await authorizationCodeGrant.requestToken(tokenFetcher, options),
    )
  }

  if (
    options.authorizationRedirect &&
    authorizationCodeGrant.isEligibleForClientRedirect(options)
  ) {
    return options.authorizationRedirect(
      authorizationCodeGrant.getRedirectUrl(options),
    )
  }

  if (clientCredentialsGrant.isEligible(options)) {
    return oauthTokenStore.set(
      await clientCredentialsGrant.getTokenFromClientOptions(
        tokenFetcher,
        options,
      ),
    )
  }

  return
}
