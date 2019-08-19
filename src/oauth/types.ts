export interface IOAuthToken {
  readonly accessToken: string
  readonly expiresIn?: number
  readonly refreshToken?: string
}

export interface ITokenStore {
  readonly set: (token: IOAuthToken) => void
  readonly get: (key: keyof IOAuthToken) => string | undefined
  readonly reset: () => void
}

export type TokenRequester = (params: IndexSignature) => Promise<IOAuthToken>
