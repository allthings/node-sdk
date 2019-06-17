import { IOAuthToken, ITokenStore } from './types'

export default function makeOAuthTokenStore(
  initialToken?: IOAuthToken,
): ITokenStore {
  // tslint:disable-next-line no-let
  let token: IOAuthToken | undefined = initialToken

  return {
    get: () => token,
    hasToken: () => !!token,
    set: (newToken?: IOAuthToken) => {
      // tslint:disable-next-line no-expression-statement
      token = newToken
    },
  }
}
