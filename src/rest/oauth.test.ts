// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { IAuthorizationResponse } from '../oauth'
import {
  getNewTokenUsingAuthorizationGrant,
  getNewTokenUsingPasswordGrant,
  getNewTokenUsingRefreshToken,
  unmemoizedGetNewTokenUsingImplicitFlow,
} from './oauth'
import oauthTokenRequest from './oauthTokenRequest'
import { IAllthingsRestClientOptions } from './types'

const redirectUri = 'allthings://redirect'

const mockReturnedAccessToken = '24b779056dcda7ade21121cb3bbfc3abfa3da69e'
const mockReturnedRefreshToken = 'fb947cd5c056a62ab767abaa6bebabf86012129e'

jest.mock('./oauthTokenRequest')

const mockOauthTokenRequest = oauthTokenRequest as jest.Mock

beforeEach(() => {
  mockOauthTokenRequest.mockReset()
  mockOauthTokenRequest.mockResolvedValueOnce({
    accessToken: mockReturnedAccessToken,
    refreshToken: mockReturnedRefreshToken,
  })
})

const assertTokensInResponse = ({
  accessToken,
  refreshToken,
}: IAuthorizationResponse) => {
  expect(accessToken).toBe(mockReturnedAccessToken)
  expect(refreshToken).toBe(mockReturnedRefreshToken)
}

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

  it('should send token request with parameters for password grant', async () => {
    const result = await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    const {
      oauthUrl,
      username,
      password,
      scope,
      clientId,
      clientSecret,
    } = DEFAULT_API_WRAPPER_OPTIONS

    expect(mockOauthTokenRequest).toBeCalledWith(`${oauthUrl}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'password',
      password,
      scope,
      username,
    })

    assertTokensInResponse(result!)
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
    const clientOptions = DEFAULT_API_WRAPPER_OPTIONS

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

  it('should send token request with parameters for authorization code grant', async () => {
    const authCode = '1234'

    const result = await getNewTokenUsingAuthorizationGrant({
      ...DEFAULT_API_WRAPPER_OPTIONS,
      authCode,
      redirectUri,
    })

    const { oauthUrl, clientId, clientSecret } = DEFAULT_API_WRAPPER_OPTIONS

    expect(mockOauthTokenRequest).toBeCalledWith(`${oauthUrl}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    })

    assertTokensInResponse(result!)
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

  it('should send token request with parameters for authorization code grant', async () => {
    const refreshToken = 'a62ab767abaa6be'

    const result = await getNewTokenUsingRefreshToken({
      ...DEFAULT_API_WRAPPER_OPTIONS,
      refreshToken,
    })

    const {
      oauthUrl,
      clientId,
      clientSecret,
      scope,
    } = DEFAULT_API_WRAPPER_OPTIONS

    expect(mockOauthTokenRequest).toBeCalledWith(`${oauthUrl}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope,
    })

    assertTokensInResponse(result!)
  })
})
