// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import {
  getNewTokenUsingPasswordGrant,
  unmemoizedGetNewTokenUsingImplicitFlow,
} from './oauth'
import { IAllthingsRestClientOptions } from './types'

describe('getNewTokenUsingPasswordGrant()', () => {
  it('should return a token given valid credentials', async () => {
    const accessToken = await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    expect(typeof accessToken).toBe('string')
  })

  it('should throw given invalid credentials', async () => {
    const idSecretUserPass = {
      clientId: '',
      clientSecret: '',
      password: '',
      username: '',
    }

    const clientOptions: IAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      ...idSecretUserPass,
    }

    await expect(getNewTokenUsingPasswordGrant(clientOptions)).rejects.toThrow(
      'HTTP 400 — Bad Request',
    )

    const clientOptions2: IAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      ...idSecretUserPass,
      oauthUrl: `${process.env.ALLTHINGS_OAUTH_URL}/foobar` || '',
    }

    await expect(getNewTokenUsingPasswordGrant(clientOptions2)).rejects.toThrow(
      'HTTP 404 — Not Found',
    )

    const clientOptions3: IAllthingsRestClientOptions = {
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

    const accessToken = await unmemoizedGetNewTokenUsingImplicitFlow(
      clientOptions,
    )

    expect(accessToken).toBe('fa778460246d25857234aff086a82fc0e83f6f1f')
  })
})
