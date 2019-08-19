// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import * as clientCredentialsGrant from './clientCredentialsGrant'

const mockOauthUrl = 'allthings.test'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
}
const mockTokenFetcher = jest.fn(async () => mockTokenResult)

beforeEach(() => mockTokenFetcher.mockClear())

describe('OAuth client credentials grant', () => {
  it('uses client credentials GRANT_TYPE', () => {
    expect(clientCredentialsGrant.GRANT_TYPE).toBe('client_credentials')
  })

  it('is eligible when client options have clientId, clientSecret', () => {
    const { clientId, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      clientCredentialsGrant.isEligible({
        clientId,
        clientSecret,
      }),
    ).toBe(true)
  })

  it('is not eligible when client secret is missing', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      clientCredentialsGrant.isEligible({
        clientId,
      }),
    ).toBe(false)
  })

  describe('requestToken', () => {
    it('throws when clientId is missing in client options', () => {
      expect(() =>
        clientCredentialsGrant.requestToken(mockTokenFetcher, {}),
      ).toThrow('Missing required "clientId"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('returns accessToken when options include clientId, clientSecret and scope', async () => {
      const { clientId, clientSecret, scope } = DEFAULT_API_WRAPPER_OPTIONS

      expect(
        await clientCredentialsGrant.requestToken(mockTokenFetcher, {
          clientId,
          clientSecret,
          oauthUrl: mockOauthUrl,
          scope,
        }),
      ).toEqual(mockTokenResult)

      expect(mockTokenFetcher).toBeCalledWith({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope,
      })
    })
  })
})
