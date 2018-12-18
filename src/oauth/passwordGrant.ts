import { RequestToken, TokenRequester } from '.'

export const GRANT_TYPE = 'password'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly username: string
  readonly password: string
  readonly client_secret?: string
  readonly scope?: string
}

export const requestToken: RequestToken = async (
  tokenRequester: TokenRequester,
  url: string,
  params: IAccessTokenRequestParams,
) => tokenRequester(url, params)
