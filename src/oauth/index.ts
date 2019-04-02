import * as authorizationCodeGrant from './authorizationCodeGrant'
import * as clientCredentialsGrant from './clientCredentialsGrant'
import * as implicitGrant from './implicitGrant'
import * as passwordGrant from './passwordGrant'
import * as refreshTokenGrant from './refreshTokenGrant'

export {
  authorizationCodeGrant,
  clientCredentialsGrant,
  implicitGrant,
  passwordGrant,
  refreshTokenGrant,
}

export interface IAuthorizationResponse {
  readonly accessToken: string
  readonly refreshToken?: string
}

export type RequestTokenParams =
  | authorizationCodeGrant.IAccessTokenRequestParams
  | clientCredentialsGrant.IAccessTokenRequestParams
  | passwordGrant.IAccessTokenRequestParams
  | refreshTokenGrant.IAccessTokenRequestParams

export type TokenRequester = (
  url: string,
  params: RequestTokenParams,
) => Promise<IAuthorizationResponse>
