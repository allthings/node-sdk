export interface IAuthorizationResponse {
  readonly accessToken: string
  readonly refreshToken?: string
}

export type TokenRequester = (
  params: IndexSignature,
) => Promise<IAuthorizationResponse>
