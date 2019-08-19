// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import * as passwordGrant from './passwordGrant'

const mockOauthUrl = 'allthings.test'

const mockTokenResult = {
  accessToken: '5c3de8a7bafd2dc34d155d40',
  refreshToken: '5c3de8a9bafd2dc34d155d41',
}
const mockTokenFetcher = jest.fn(async () => mockTokenResult)

beforeEach(() => mockTokenFetcher.mockClear())

describe('OAuth password grant', () => {
  it('uses password GRANT_TYPE', () => {
    expect(passwordGrant.GRANT_TYPE).toBe('password')
  })

  it('is eligible when client options have clientId, username and password', () => {
    const { clientId, username, password } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      passwordGrant.isEligible({
        clientId,
        password,
        username,
      }),
    ).toBe(true)
  })

  it('is not eligible when username is missing', () => {
    const { clientId, password } = DEFAULT_API_WRAPPER_OPTIONS
    expect(
      passwordGrant.isEligible({
        clientId,
        password,
      }),
    ).toBe(false)
  })

  describe('requestToken', () => {
    it('throws when clientId is missing in client options', () => {
      expect(() => passwordGrant.requestToken(mockTokenFetcher, {})).toThrow(
        'Missing required "clientId"',
      )
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('throws when username is missing in client options', () => {
      const { clientId } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() =>
        passwordGrant.requestToken(mockTokenFetcher, {
          clientId,
        }),
      ).toThrow('Missing required "username"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('throws when password is missing in client options', () => {
      const { clientId, username } = DEFAULT_API_WRAPPER_OPTIONS

      expect(() =>
        passwordGrant.requestToken(mockTokenFetcher, {
          clientId,
          username,
        }),
      ).toThrow('Missing required "password"')
      expect(mockTokenFetcher).not.toBeCalled()
    })

    it('returns accessToken and refreshToken when options include clientId, username and password', async () => {
      const { clientId, username, password } = DEFAULT_API_WRAPPER_OPTIONS

      expect(
        await passwordGrant.requestToken(mockTokenFetcher, {
          clientId,
          oauthUrl: mockOauthUrl,
          password,
          username,
        }),
      ).toEqual(mockTokenResult)

      expect(mockTokenFetcher).toBeCalledWith({
        client_id: clientId,
        grant_type: 'password',
        password,
        username,
      })
    })

    it('provides scope and client_secret if they were specified in client options', async () => {
      const {
        clientId,
        username,
        password,
        scope,
        clientSecret,
      } = DEFAULT_API_WRAPPER_OPTIONS

      await passwordGrant.requestToken(mockTokenFetcher, {
        clientId,
        clientSecret,
        oauthUrl: mockOauthUrl,
        password,
        scope,
        username,
      })

      expect(mockTokenFetcher).toBeCalledWith({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'password',
        password,
        scope,
        username,
      })
    })
  })
})
