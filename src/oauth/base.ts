export interface IAuthorizationResponse {
  readonly accessToken: string
  readonly refreshToken?: string
}

export type TokenRequester = (
  url: string,
  params: IndexSignature,
) => Promise<IAuthorizationResponse>
