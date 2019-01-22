// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { refreshTokenGrant } from './'

const mockOauthUrl = 'allthings.test'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
  refreshToken: '5c3de8a9bafd2dc34d155d41',
}
const mockTokenFetcher = jest.fn(async () => mockTokenResult)
const mockRefreshToken = '5c407223cd732429cd8acfe3'

beforeEach(() => mockTokenFetcher.mockClear())

describe('OAuth refresh token grant', () => {
  it('uses refresh_token GRANT_TYPE', () => {
    expect(refreshTokenGrant.GRANT_TYPE).toBe('refresh_token')
  })

  it('is eligible when client options have clientId, username and password', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      refreshTokenGrant.isEligible({
        clientId,
        refreshToken: mockRefreshToken,
      }),
    ).toBe(true)
  })

  it('is not eligible when refreshToken is missing', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      refreshTokenGrant.isEligible({
        clientId,
      }),
    ).toBe(false)
  })

  describe('getTokenFromClientOptions', () => {
    it('throws when clientId is missing in client options', () => {
      expect(() =>
        refreshTokenGrant.getTokenFromClientOptions(mockTokenFetcher, {}),
      ).toThrow('Missing required "clientId"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('throws when refreshToken is missing in client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() =>
        refreshTokenGrant.getTokenFromClientOptions(mockTokenFetcher, {
          clientId,
        }),
      ).toThrow('Missing required "refreshToken"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('returns accessToken and refreshToken when options include clientId and refreshToken', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(
        await refreshTokenGrant.getTokenFromClientOptions(mockTokenFetcher, {
          clientId,
          oauthUrl: mockOauthUrl,
          refreshToken: mockRefreshToken,
        }),
      ).toEqual(mockTokenResult)

      expect(mockTokenFetcher).toBeCalledWith(`${mockOauthUrl}/oauth/token`, {
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: mockRefreshToken,
      })
    })

    it('provides scope and client_secret if they were specified in client options', async () => {
      const { clientId, scope, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS

      await refreshTokenGrant.getTokenFromClientOptions(mockTokenFetcher, {
        clientId,
        clientSecret,
        oauthUrl: mockOauthUrl,
        refreshToken: mockRefreshToken,
        scope,
      })

      expect(mockTokenFetcher).toBeCalledWith(`${mockOauthUrl}/oauth/token`, {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: mockRefreshToken,
        scope,
      })
    })
  })
})
