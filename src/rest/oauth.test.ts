// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import {
  getNewTokenUsingAuthorizationGrant,
  getNewTokenUsingPasswordGrant,
  getNewTokenUsingRefreshToken,
  unmemoizedGetNewTokenUsingImplicitFlow,
} from './oauth'
import { IAllthingsRestClientOptions } from './types'

describe('getNewTokenUsingPasswordGrant()', () => {
  it('should throw if clientId is missing', async () => {
    await expect(
      getNewTokenUsingPasswordGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        clientId: '',
      }),
    ).rejects.toThrow('required "clientId"')
  })

  it('should throw if username is missing', async () => {
    await expect(
      getNewTokenUsingPasswordGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        username: '',
      }),
    ).rejects.toThrow('required "username"')
  })

  it('should throw if password is missing', async () => {
    await expect(
      getNewTokenUsingPasswordGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        password: '',
      }),
    ).rejects.toThrow('required "password"')
  })

  it('should return a token given valid credentials', async () => {
    const response = await getNewTokenUsingPasswordGrant({
      ...DEFAULT_API_WRAPPER_OPTIONS,
      redirectUri: 'any',
    })

    expect(response).toBeTruthy()
    expect(response).toHaveProperty('accessToken')
    expect(response).toHaveProperty('refreshToken')
    expect(response && typeof response.accessToken).toBe('string')
    expect(response && typeof response.refreshToken).toBe('string')
  })

  it('should not return a token if clientSecret is not specified', async () => {
    await expect(
      getNewTokenUsingPasswordGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        clientSecret: undefined,
        redirectUri: 'any',
      }),
    ).rejects.toThrow('Could not get token')
  })
})

describe('getNewTokenUsingImplicitFlow()', () => {
  it('should return a token given valid credentials', async () => {
    const clientOptions: IAllthingsRestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

    // tslint:disable-next-line no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: { hash: '', href: '', origin: 'https://foobar.test/foo/bar' },
    }

    const token = await unmemoizedGetNewTokenUsingImplicitFlow(clientOptions)

    expect(token).toBe(undefined)
    // tslint:disable-next-line no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: {
        hash: 'access_token=fa778460246d25857234aff086a82fc0e83f6f1f',
        href: '',
        origin: '',
      },
    }

    const response = await unmemoizedGetNewTokenUsingImplicitFlow(clientOptions)

    expect(response && response.accessToken).toBe(
      'fa778460246d25857234aff086a82fc0e83f6f1f',
    )
  })
})

describe('getNewTokenUsingAuthorizationGrant()', () => {
  const redirectUri = 'allthings://redirect'

  it('should throw if clientId is missing', async () => {
    await expect(
      getNewTokenUsingAuthorizationGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        clientId: '',
      }),
    ).rejects.toThrow('required "clientId"')
  })

  it('should throw if redirectUri is missing', async () => {
    await expect(
      getNewTokenUsingAuthorizationGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        redirectUri: '',
      }),
    ).rejects.toThrow('required "redirectUri"')
  })

  it('should call authorizationRedirect if no authToken was provided', async () => {
    const clientOptions: IAllthingsRestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

    const authorizationRedirect = jest.fn()

    await getNewTokenUsingAuthorizationGrant({
      ...clientOptions,
      authorizationRedirect,
      redirectUri,
    })
    expect(authorizationRedirect).toBeCalledWith(
      [
        `${DEFAULT_API_WRAPPER_OPTIONS.oauthUrl}/oauth/authorize`,
        `?client_id=${DEFAULT_API_WRAPPER_OPTIONS.clientId}`,
        `&redirect_uri=${encodeURIComponent(redirectUri)}`,
        '&response_type=code',
        '&scope=user%3Aprofile',
        `&state=${DEFAULT_API_WRAPPER_OPTIONS.state}`,
      ].join(''),
    )
  })

  it('should throw if neither authCode nor authorizationRedirect is provided', async () => {
    await expect(
      getNewTokenUsingAuthorizationGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        authCode: '',
        redirectUri,
      }),
    ).rejects.toThrow('provide either "authCode" or "authorizationRedirect"')
  })

  it('should make a request and return a token if valid authCode is provided', async () => {
    const clientOptions: IAllthingsRestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

    jest.resetModules()
    jest.mock('cross-fetch')

    const mockFetch = require('cross-fetch').default
    const mockMakeApiRequest = require('./oauth')
      .getNewTokenUsingAuthorizationGrant

    mockFetch.mockResolvedValueOnce({
      headers: new Map([['application/json', 'charset= utf-8']]),
      json: () => ({
        access_token: '24b779056dcda7ade21121cb3bbfc3abfa3da69e',
        expires_in: 14400,
        refresh_token: 'fb947cd5c056a62ab767abaa6bebabf86012129e',
        scope: 'user:profile',
        token_type: 'Bearer',
      }),
      ok: true,
      status: 200,
    })

    const { accessToken, refreshToken } = await mockMakeApiRequest({
      ...clientOptions,
      authCode: 'c34660c481e978a0caed2cce003ba7eb528c8554',
      redirectUri,
    })

    expect(accessToken).toBe('24b779056dcda7ade21121cb3bbfc3abfa3da69e')
    expect(refreshToken).toBe('fb947cd5c056a62ab767abaa6bebabf86012129e')
  })
})

describe('getNewTokenUsingRefreshToken()', () => {
  it('should throw if clientId is missing', async () => {
    await expect(
      getNewTokenUsingRefreshToken({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        clientId: '',
      }),
    ).rejects.toThrow('required "clientId"')
  })

  it('should throw if refreshToken is missing', async () => {
    await expect(
      getNewTokenUsingRefreshToken({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        refreshToken: '',
      }),
    ).rejects.toThrow('required "refreshToken"')
  })

  it('should make a request return a token if valid authCode is provided', async () => {
    const clientOptions: RestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

    jest.resetModules()
    jest.mock('cross-fetch')

    const mockFetch = require('cross-fetch').default
    const mockMakeApiRequest = require('./oauth')
      .getNewTokenUsingRefreshToken

    mockFetch.mockResolvedValueOnce({
      headers: new Map([['application/json', 'charset= utf-8']]),
      json: () => ({
        access_token: '24b779056dcda7ade21121cb3bbfc3abfa3da69e',
        expires_in: 14400,
        refresh_token: 'fb947cd5c056a62ab767abaa6bebabf86012129e',
        scope: 'user:profile',
        token_type: 'Bearer',
      }),
      ok: true,
      status: 200,
    })

    const { accessToken, refreshToken } = await mockMakeApiRequest({
      ...clientOptions,
      refreshToken: '24b779056dcda7ade21121cb3bbfc3abfa3da69d'
    })

    expect(accessToken).toBe('24b779056dcda7ade21121cb3bbfc3abfa3da69e')
    expect(refreshToken).toBe('fb947cd5c056a62ab767abaa6bebabf86012129e')
  })
})
