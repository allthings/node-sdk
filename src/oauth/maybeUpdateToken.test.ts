/**
 * @jest-environment jsdom
 */

// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import * as authorizationCodeGrant from './authorizationCodeGrant'
import * as clientCredentialsGrant from './clientCredentialsGrant'
import makeOAuthTokenStore from './makeOAuthTokenStore'
import maybeUpdateToken from './maybeUpdateToken'
import * as passwordGrant from './passwordGrant'
import * as refreshTokenGrant from './refreshTokenGrant'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
  refreshToken: '5c3de8a9bafd2dc34d155d41',
}

const mockRefreshToken = '5c3deb09a0367dad13f1609a'
const mockAccessToken = '5c3deb09a0367dcd13f1609a'

const mockTokenFetcher = jest.fn(async () => mockTokenResult)
const mockTokenStore = makeOAuthTokenStore()

beforeEach(() => {
  mockTokenStore.set()
  mockTokenFetcher.mockClear()
})

describe('maybeUpdateToken', () => {
  it('should invoke refresh token when mustRefresh provided and refresh token specified', async () => {
    mockTokenStore.set({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    })
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    await maybeUpdateToken(
      mockTokenStore,
      mockTokenFetcher,
      {
        clientId,
      },
      true,
    )
    expect(mockTokenStore.get()).toBe(mockTokenResult)
    expect(mockTokenFetcher).toBeCalledWith({
      client_id: clientId,
      grant_type: refreshTokenGrant.GRANT_TYPE,
      refresh_token: mockRefreshToken,
    })
  })

  it('should do nothing if token already exist and refresh is not required', async () => {
    mockTokenStore.set({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    })
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
    })

    expect(mockTokenFetcher).not.toBeCalled()
    expect(mockTokenStore.get()).toEqual(
      expect.objectContaining({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      }),
    )
  })

  it('should invoke password flow if has username and password provided', async () => {
    const { clientId, username, password } = DEFAULT_API_WRAPPER_OPTIONS
    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
      password,
      username,
    })
    expect(mockTokenFetcher).toBeCalledWith({
      client_id: clientId,
      grant_type: passwordGrant.GRANT_TYPE,
      password,
      username,
    })
    expect(mockTokenStore.get()).toEqual(
      expect.objectContaining(mockTokenResult),
    )
  })

  it('should take accessToken from location.href if implicit option provided', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

    window.history.pushState({}, 'any', `test#access_token=${mockAccessToken}`)

    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
      implicit: true,
    })

    expect(mockTokenStore.get()).toEqual(
      expect.objectContaining({ accessToken: mockAccessToken }),
    )
  })

  it('should redirect browser if implicit option provided and no access token in the URL', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

    const result = await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
      implicit: true,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })

  it("should return undefined and don't redirect browser if implicit option provided and no clientId provided", async () => {
    const result = await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      implicit: true,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })

  it('should invoke authorization code flow if has authenticationCode and redirectUri provided', async () => {
    const { clientId, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS
    const mockRedirectUri = 'allthings'
    const mockAuthCode = '973049753'

    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      authenticationCode: mockAuthCode,
      clientId,
      clientSecret,
      redirectUri: mockRedirectUri,
    })
    expect(mockTokenFetcher).toBeCalledWith({
      client_id: clientId,
      client_secret: clientSecret,
      code: mockAuthCode,
      grant_type: authorizationCodeGrant.GRANT_TYPE,
      redirect_uri: mockRedirectUri,
    })
    expect(mockTokenStore.get()).toEqual(
      expect.objectContaining(mockTokenResult),
    )
  })

  it('should call authorizationRedirect when redirectUri and authorizationRedirect provided', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const mockRedirectUri = 'allthings'
    const mockRedirectFn = jest.fn()

    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      authorizationRedirect: mockRedirectFn,
      clientId,
      redirectUri: mockRedirectUri,
    })

    expect(mockRedirectFn).toBeCalled()
  })

  it('should invoke client credentials flow if has client id, client secret and scope provided', async () => {
    const { clientId, clientSecret, scope } = DEFAULT_API_WRAPPER_OPTIONS
    await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
      clientSecret,
      scope,
    })
    expect(mockTokenStore.get()).toEqual(
      expect.objectContaining(mockTokenResult),
    )
    expect(mockTokenFetcher).toBeCalledWith({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: clientCredentialsGrant.GRANT_TYPE,
      scope,
    })
  })

  it('returns undefined if no flow is eligible', async () => {
    const { clientId } = DEFAULT_API_WRAPPER_OPTIONS
    const result = await maybeUpdateToken(mockTokenStore, mockTokenFetcher, {
      clientId,
    })

    expect(result).toBeUndefined()
    expect(mockTokenFetcher).not.toBeCalled()
  })
})