import { IOAuthToken, ITokenStore } from './types'

export default async function requestAndSaveToStore(
  requester: () => Promise<IOAuthToken>,
  tokenStore: ITokenStore,
): Promise<IOAuthToken> {
  const response = await requester()
  // tslint:disable-next-line no-expression-statement
  tokenStore.set(response)

  return response
}
