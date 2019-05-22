// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { authorizationCodeGrant } from './'

const mockOauthUrl = 'allthings.test'
const mockRedirectUri = 'allthings'
const mockAuthCode = 'allthings-auth-code'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
  refreshToken: '5c3de8a9bafd2dc34d155d41',
}
const mockTokenFetcher = jest.fn(async () => mockTokenResult)

beforeEach(() => mockTokenFetcher.mockClear())

describe('OAuth authorization code grant', () => {
  it('uses authorization_code GRANT_TYPE', () => {
    expect(authorizationCodeGrant.GRANT_TYPE).toBe('authorization_code')
  })

  it('uses code RESPONSE_TYPE', () => {
    expect(authorizationCodeGrant.RESPONSE_TYPE).toBe('code')
  })

  it('is eligible when client options have clientId, redirectUri and authCode', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      authorizationCodeGrant.isEligible({
        authCode: mockAuthCode,
        clientId,
        redirectUri: mockRedirectUri,
      }),
    ).toBe(true)
  })

  it('not eligible when authCode is missing', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      authorizationCodeGrant.isEligible({
        clientId,
        redirectUri: mockRedirectUri,
      }),
    ).toBe(false)
  })

  it('is eligible for redirect when client options have clientId, redirectUri', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      authorizationCodeGrant.isEligibleForClientRedirect({
        clientId,
        redirectUri: mockRedirectUri,
      }),
    ).toBe(true)
  })

  it('is not eligible for redirect when redirectUri is missing', () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      authorizationCodeGrant.isEligibleForClientRedirect({
        clientId,
      }),
    ).toBe(false)
  })

  describe('getRedirectUrl', () => {
    it('throws when clientId is missing in client options', () => {
      expect(() => authorizationCodeGrant.getRedirectUrl({})).toThrow(
        'Missing required "clientId"',
      )
    })

    it('throws when redirectUri is missing in client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() => authorizationCodeGrant.getRedirectUrl({ clientId })).toThrow(
        'Missing required "redirectUri"',
      )
    })

    it('returns URL to /oauh/authorize including stringified client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
      expect(
        authorizationCodeGrant.getRedirectUrl({
          clientId,
          oauthUrl: mockOauthUrl,
          redirectUri: mockRedirectUri,
        }),
      ).toEqual(
        `${mockOauthUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${mockRedirectUri}&response_type=code`,
      )
    })

    it('includes scope and state if provided in options', () => {
      const { clientId, state, scope } = DEFAULT_API_WRAPPER_OPTIONS
      const url = authorizationCodeGrant.getRedirectUrl({
        clientId,
        oauthUrl: mockOauthUrl,
        redirectUri: mockRedirectUri,
        scope,
        state,
      })

      expect(url).toContain(`state=${encodeURIComponent(state!)}`)
      expect(url).toContain(`scope=${encodeURIComponent(scope!)}`)
    })
  })

  describe('getTokenFromClientOptions', () => {
    it('throws when clientId is missing in client options', () => {
      expect(() =>
        authorizationCodeGrant.getTokenFromClientOptions(mockTokenFetcher, {}),
      ).toThrow('Missing required "clientId"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('throws when redirectUri is missing in client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() =>
        authorizationCodeGrant.getTokenFromClientOptions(mockTokenFetcher, {
          clientId,
        }),
      ).toThrow('Missing required "redirectUri"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('throws when authCode is missing in client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() =>
        authorizationCodeGrant.getTokenFromClientOptions(mockTokenFetcher, {
          clientId,
          redirectUri: mockRedirectUri,
        }),
      ).toThrow('Missing required "authCode"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('returns accessToken and refreshToken when options include clientId, redirectUri and authCode', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(
        await authorizationCodeGrant.getTokenFromClientOptions(
          mockTokenFetcher,
          {
            authCode: mockAuthCode,
            clientId,
            oauthUrl: mockOauthUrl,
            redirectUri: mockRedirectUri,
          },
        ),
      ).toEqual(mockTokenResult)

      expect(mockTokenFetcher).toBeCalledWith(`${mockOauthUrl}/oauth/token`, {
        client_id: clientId,
        code: mockAuthCode,
        grant_type: 'authorization_code',
        redirect_uri: mockRedirectUri,
      })
    })

    it('provides client_secret if was specified in client options', async () => {
      const { clientId, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS

      await authorizationCodeGrant.getTokenFromClientOptions(mockTokenFetcher, {
        authCode: mockAuthCode,
        clientId,
        clientSecret,
        oauthUrl: mockOauthUrl,
        redirectUri: mockRedirectUri,
      })

      expect(mockTokenFetcher).toBeCalledWith(`${mockOauthUrl}/oauth/token`, {
        client_id: clientId,
        client_secret: clientSecret,
        code: mockAuthCode,
        grant_type: 'authorization_code',
        redirect_uri: mockRedirectUri,
      })
    })
  })
})
