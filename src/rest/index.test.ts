// tslint:disable:no-expression-statement
import restClient from '.'
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import * as authenticationCodeGrant from '../oauth/authorizationCodeGrant'
import createTokenStore from '../oauth/createTokenStore'
import * as makeFetchTokenRequesterModule from '../oauth/makeFetchTokenRequester'
import * as passwordGrant from '../oauth/passwordGrant'

const redirectUri = 'allthings://redirect'

describe('Rest API Client', () => {
  it('should return a client', async () => {
    const client = restClient()

    expect(client).toBeTruthy()
    expect(typeof client).toBe('object')
  })

  it('should use accessToken when provided in options object', async () => {
    const { accessToken } = await passwordGrant.requestToken(
      makeFetchTokenRequesterModule.default(
        `${DEFAULT_API_WRAPPER_OPTIONS.oauthUrl}/oauth/token`,
      ),
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    const client = restClient({
      accessToken,
    })

    const me = await client.get('/v1/me')
    expect(me).toHaveProperty('id')
  })

  it('should use tokenStore when provided in options object', async () => {
    const { accessToken } = await passwordGrant.requestToken(
      makeFetchTokenRequesterModule.default(
        `${DEFAULT_API_WRAPPER_OPTIONS.oauthUrl}/oauth/token`,
      ),
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    const client = restClient({
      tokenStore: createTokenStore({ accessToken }),
    })

    const me = await client.get('/v1/me')
    expect(me).toHaveProperty('id')
  })

  it('should throw error when apiUrl parameter is not provided', async () => {
    expect(() => restClient({ apiUrl: undefined } as any)).toThrow()
  })

  it('should throw error when oauthUrl parameter is not provided', async () => {
    expect(() => restClient({ oauthUrl: undefined } as any)).toThrow()
  })

  it('should throw error when clientId parameter is not provided', async () => {
    expect(() => restClient({ clientId: undefined } as any)).toThrow()
  })

  it('should use default options when none provided, and process.env variables unset', async () => {
    jest.resetModules()

    // tslint:disable no-delete no-object-mutation
    delete process.env.ALLTHINGS_OAUTH_CLIENT_ID
    delete process.env.ALLTHINGS_OAUTH_CLIENT_SECRET
    delete process.env.ALLTHINGS_OAUTH_USERNAME
    delete process.env.ALLTHINGS_OAUTH_PASSWORD
    delete process.env.ALLTHINGS_REST_API_URL
    delete process.env.ALLTHINGS_OAUTH_URL
    // tslint:enable no-delete no-object-mutation

    const restClient2 = require('.').default

    const client = restClient2({ clientId: 'foobar' } as any)

    expect(client.options).toMatchObject({
      apiUrl: 'https://api.allthings.me',
      clientId: 'foobar',
      clientSecret: undefined,
      oauthUrl: 'https://accounts.allthings.me',
      password: undefined,
      username: undefined,
    })

    jest.resetModules()
    // restore process.env.ALLTHINGS_* test values
    require('../../test/setup')
  })

  it('should throw error when unable to get access token', async () => {
    const client = restClient({
      accessToken: undefined,
      clientSecret: undefined,
      password: undefined,
      username: undefined,
    })

    await expect(
      client.appCreate('foobar', { name: 'foobar', siteUrl: 'foobar.test' }),
    ).rejects.toThrow('Unable to get OAuth2 access token')
  })

  describe('exposed OAuth', () => {
    const mockToken = { accessToken: '1234567890', refreshToken: 'ABCDEF200' }

    beforeEach(() => {
      const mockTokenRequester = async () => mockToken

      jest
        .spyOn(makeFetchTokenRequesterModule, 'default')
        .mockReturnValue(mockTokenRequester)
    })

    it('oauth.authorizationCode.getUri should return authorization URL for provided state', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const client = restClient({
        clientId,
        redirectUri,
      })

      const state = 'state-as-argument'

      const uri = new URL(client.oauth.authorizationCode.getUri(state))

      expect(uri).toMatchObject({
        origin: DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
        pathname: '/oauth/authorize',
      })
      expect(uri.searchParams.get('client_id')).toEqual(
        DEFAULT_API_WRAPPER_OPTIONS.clientId,
      )
      expect(uri.searchParams.get('redirect_uri')).toEqual(redirectUri)
      expect(uri.searchParams.get('response_type')).toEqual(
        authenticationCodeGrant.RESPONSE_TYPE,
      )
      expect(uri.searchParams.get('scope')).toEqual(
        DEFAULT_API_WRAPPER_OPTIONS.scope,
      )
      expect(uri.searchParams.get('state')).toEqual(state)
    })

    it('oauth.authorizationCode.getUri should return authorization URL for state provided in options', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const state = 'state-from-options'

      const client = restClient({
        clientId,
        redirectUri,
        state,
      })

      expect(
        new URL(client.oauth.authorizationCode.getUri()).searchParams.get(
          'state',
        ),
      ).toEqual(state)
    })

    it('oauth.authorizationCode.getUri should return authorization URL randomly generated state', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const client = restClient({
        clientId,
        redirectUri,
      })

      expect(
        new URL(client.oauth.authorizationCode.getUri()).searchParams.get(
          'state',
        ),
      ).toMatch(/^[0-9a-z]{16}$/)
    })

    it('oauth.authorizationCode.requestToken should make a /token request and return new token for provided authorization code', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const client = restClient({
        clientId,
        redirectUri,
      })

      const authCode = '1234'

      await expect(
        client.oauth.authorizationCode.requestToken(authCode),
      ).resolves.toEqual(mockToken)
    })

    it('oauth.authorizationCode.requestToken should make a /token request and return new token authorization code provided in options', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const authCode = '1234'

      const client = restClient({
        authorizationCode: authCode,
        clientId,
        redirectUri,
      })

      await expect(
        client.oauth.authorizationCode.requestToken(),
      ).resolves.toEqual(mockToken)
    })

    it('oauth.refreshToken should make a token request and return a new token', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const client = restClient({
        clientId,
        redirectUri,
        refreshToken: 'qwerty',
      })

      await expect(client.oauth.refreshToken()).resolves.toEqual(mockToken)
    })

    it('oauth.refreshToken should make a token request and return a new token based on refreshToken already stored', async () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      const client = restClient({
        authorizationCode: '1234',
        clientId,
        redirectUri,
      })

      await client.oauth.authorizationCode.requestToken()

      await expect(client.oauth.refreshToken()).resolves.toEqual(mockToken)
    })

    it('oauth.generateState generates a unique 16 symbol string per invocation', () => {
      const client = restClient(DEFAULT_API_WRAPPER_OPTIONS)
      const state1 = client.oauth.generateState()
      const state2 = client.oauth.generateState()
      expect(state1).toMatch(/^[0-9a-z]{16}$/)
      expect(state2).toMatch(/^[0-9a-z]{16}$/)
      expect(state1).not.toEqual(state2)
    })
  })
})
