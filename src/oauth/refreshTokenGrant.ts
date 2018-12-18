import { RequestToken, TokenRequester } from '.'

export const GRANT_TYPE = 'refresh_token'

export interface IAccessTokenRequestParams {
  readonly client_id: string
  readonly grant_type: string
  readonly refresh_token: string
  readonly client_secret?: string
  readonly scope?: string
}

export const requestToken: RequestToken = async (
  tokenRequester: TokenRequester,
  url: string,
  params: IAccessTokenRequestParams,
) => tokenRequester(url, params)
