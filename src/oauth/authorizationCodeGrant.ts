import { RequestToken, TokenRequester } from '.'

export const RESPONSE_TYPE = 'code'
export const GRANT_TYPE = 'authorization_code'

export interface IAuthorizationRequestParams {
  readonly client_id: string
  readonly response_type: string
  readonly redirect_uri?: string
  readonly scope?: string
  readonly state?: string
}

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly code: string
  readonly grant_type: string
  readonly redirect_uri: string
  readonly client_secret?: string
}

export const requestToken: RequestToken = async (
  tokenRequester: TokenRequester,
  url: string,
  params: IAccessTokenRequestParams,
) => tokenRequester(url, params)
