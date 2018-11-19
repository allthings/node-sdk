// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import {
  getNewTokenUsingPasswordGrant,
  unmemoizedGetNewTokenUsingAuthorizationGrant,
  unmemoizedGetNewTokenUsingImplicitFlow,
} from './oauth'
import { InterfaceAllthingsRestClientOptions } from './types'

describe('getNewTokenUsingPasswordGrant()', () => {
  it('should return a token given valid credentials', async () => {
    const response = await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    expect(response).toBeTruthy()
    expect(response).toHaveProperty('accessToken')
    expect(response).toHaveProperty('refreshToken')
    expect(response && typeof response.accessToken).toBe('string')
    expect(response && typeof response.refreshToken).toBe('string')
  })

  it('should throw given invalid credentials', async () => {
    const idSecretUserPass = {
      clientId: '',
      clientSecret: '',
      password: '',
      username: '',
    }

    const clientOptions: InterfaceAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      ...idSecretUserPass,
    }

    await expect(getNewTokenUsingPasswordGrant(clientOptions)).rejects.toThrow(
      'HTTP 400 — Bad Request',
    )

    const clientOptions2: InterfaceAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      ...idSecretUserPass,
      oauthUrl: `${process.env.ALLTHINGS_OAUTH_URL}/foobar` || '',
    }

    await expect(getNewTokenUsingPasswordGrant(clientOptions2)).rejects.toThrow(
      'HTTP 404 — Not Found',
    )

    const clientOptions3: InterfaceAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      ...idSecretUserPass,
      oauthUrl: 'http://foobarHost',
    }

    await expect(getNewTokenUsingPasswordGrant(clientOptions3)).rejects.toThrow(
      'ENOTFOUND',
    )
  })
})

describe('getNewTokenUsingImplicitFlow()', () => {
  it('should return a token given valid credentials', async () => {
    const clientOptions: InterfaceAllthingsRestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

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
  it('should return a token given valid credentials', async () => {
    const clientOptions: InterfaceAllthingsRestClientOptions = DEFAULT_API_WRAPPER_OPTIONS

    // tslint:disable-next-line no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: {
        hash: '',
        href: '',
        origin: 'https://foobar.test/foo/bar',
        search: '',
      },
    }

    const token = await unmemoizedGetNewTokenUsingAuthorizationGrant(
      clientOptions,
    )

    expect(token).toBe(undefined)
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('cross-fetch')

    const mockFetch = require('cross-fetch').default
    const mockMakeApiRequest = require('./oauth')
      .unmemoizedGetNewTokenUsingAuthorizationGrant

    mockFetch.mockResolvedValueOnce({
      headers: new Map([['application / json', 'charset= utf - 8']]),
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

    // tslint:disable-next-line no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: {
        hash: '',
        href: '',
        origin: 'https://foobar.test/foo/bar',
        search: 'code=eace4929bbdbfea52cda219a2278f2a12a3d694c',
      },
    }

    const { accessToken, refreshToken } = await mockMakeApiRequest(
      clientOptions,
    )

    expect(accessToken).toBe('24b779056dcda7ade21121cb3bbfc3abfa3da69e')
    expect(refreshToken).toBe('fb947cd5c056a62ab767abaa6bebabf86012129e')
  })
})
