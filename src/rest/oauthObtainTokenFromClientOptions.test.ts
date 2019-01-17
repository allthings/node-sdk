/**
 * @jest-environment jsdom
 */

// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import {
  authorizationCodeGrant,
  passwordGrant,
  refreshTokenGrant,
} from '../oauth'
import oauthObtainTokenFromClientOptions from './oauthObtainTokenFromClientOptions'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
  refreshToken: '5c3de8a9bafd2dc34d155d41',
}

const mockRefreshToken = '5c3deb09a0367dad13f1609a'
const mockAccessToken = '5c3deb09a0367dcd13f1609a'

const mockTokenFetcher = jest.fn(async () => mockTokenResult)

beforeEach(() => {
  mockTokenFetcher.mockClear()
})

describe('oauthObtainTokenFromClientOptions', () => {
  it('should invoke refresh token when mustRefresh provided and refresh token specified', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const result = await oauthObtainTokenFromClientOptions(
      mockTokenFetcher,
      {
        clientId,
        refreshToken: mockRefreshToken,
      },
      true,
    )
    expect(result).toBe(mockTokenResult)
    expect(mockTokenFetcher).toBeCalledWith(expect.any(String), {
      client_id: clientId,
      grant_type: refreshTokenGrant.GRANT_TYPE,
      refresh_token: mockRefreshToken,
    })
  })

  it('should return accessToken and refreshToken if they already exist', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      accessToken: mockAccessToken,
      clientId,
      refreshToken: mockRefreshToken,
    })
    expect(result).toEqual({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    })

    expect(mockTokenFetcher).not.toBeCalled()
  })

  it('should invoke password flow if has username and password provided', async () => {
    const { clientId, username, password } = DEFAULT_API_WRAPPER_OPTIONS
    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      clientId,
      password,
      username,
    })
    expect(result).toBe(mockTokenResult)
    expect(mockTokenFetcher).toBeCalledWith(expect.any(String), {
      client_id: clientId,
      grant_type: passwordGrant.GRANT_TYPE,
      password,
      username,
    })
  })

  it('should take accessToken from location.href if implicit option provided', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

    window.history.pushState({}, 'any', `test#access_token=${mockAccessToken}`)

    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      clientId,
      implicit: true,
    })

    expect(result).toEqual({ accessToken: mockAccessToken })
  })

  it('should redirect browser if implicit option provided and no access token in the URL', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      clientId,
      implicit: true,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })

  it("should return undefined and don't redirect browser if implicit option provided and no clientId provided", async () => {
    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      implicit: true,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })

  it('should invoke authorization code flow if has authCode and redirectUri provided', async () => {
    const { clientId, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS
    const mockRedirectUri = 'allthings'
    const mockAuthCode = '973049753'

    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      authCode: mockAuthCode,
      clientId,
      clientSecret,
      redirectUri: mockRedirectUri,
    })
    expect(result).toBe(mockTokenResult)
    expect(mockTokenFetcher).toBeCalledWith(expect.any(String), {
      client_id: clientId,
      client_secret: clientSecret,
      code: mockAuthCode,
      grant_type: authorizationCodeGrant.GRANT_TYPE,
      redirect_uri: mockRedirectUri,
    })
  })

  it('should call authorizationRedirect when redirectUri and authorizationRedirect provided', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const mockRedirectUri = 'allthings'
    const mockRedirectFn = jest.fn()

    await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      authorizationRedirect: mockRedirectFn,
      clientId,
      redirectUri: mockRedirectUri,
    })

    expect(mockRedirectFn).toBeCalled()
  })

  it('returns undefined if no flow is eligible', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const result = await oauthObtainTokenFromClientOptions(mockTokenFetcher, {
      clientId,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })
})
