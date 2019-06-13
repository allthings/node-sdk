export interface IOAuthToken {
  readonly accessToken: string
  readonly expiresAt?: number
  readonly refreshToken?: string
}

export interface ITokenStore {
  readonly hasToken: () => boolean
  readonly set: (token?: IOAuthToken) => void
  readonly get: () => IOAuthToken | undefined
}

export type TokenRequester = (params: IndexSignature) => Promise<IOAuthToken>
