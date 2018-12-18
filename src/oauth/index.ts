import * as authorizationCodeGrant from './authorizationCodeGrant'
import * as passwordGrant from './passwordGrant'
import * as refreshTokenGrant from './refreshTokenGrant'

export { authorizationCodeGrant, passwordGrant, refreshTokenGrant }

export interface IAuthorizationResponse {
  readonly accessToken: string
  readonly refreshToken?: string
}

export type RequestTokenParams =
  | authorizationCodeGrant.IAccessTokenRequestParams
  | passwordGrant.IAccessTokenRequestParams
  | refreshTokenGrant.IAccessTokenRequestParams

export type TokenRequester = (
  url: string,
  params: RequestTokenParams,
) => Promise<IAuthorizationResponse>

export type RequestToken = (
  tokenRequester: TokenRequester,
  url: string,
  params: RequestTokenParams,
) => Promise<IAuthorizationResponse>
