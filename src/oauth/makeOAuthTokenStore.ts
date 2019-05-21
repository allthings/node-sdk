import { IOAuthToken, ITokenStore } from './base'

export default function makeOAuthTokenStore(): ITokenStore {
  // tslint:disable-next-line no-let
  let token: IOAuthToken

  return {
    get: () => token,
    set: (newToken: IOAuthToken) => {
      // tslint:disable-next-line no-expression-statement
      token = newToken
    },
  }
}
