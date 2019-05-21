export interface IOAuthToken {
  readonly accessToken: string
  readonly refreshToken?: string
}

export interface ITokenStore {
  readonly set: (token: IOAuthToken) => void
  readonly get: () => IOAuthToken | undefined
}

export type TokenRequester = (params: IndexSignature) => Promise<IOAuthToken>
