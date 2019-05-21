import { IOAuthToken, ITokenStore } from './base'

export default function makeOAuthTokenStore(): ITokenStore {
  // tslint:disable-next-line no-let
  let token: IOAuthToken | undefined

  return {
    get: () => token,
    hasToken: () => !!token,
    set: (newToken?: IOAuthToken) => {
      // tslint:disable-next-line no-expression-statement
      token = newToken
    },
  }
}
