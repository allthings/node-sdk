// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'
import querystring from 'query-string'
import { DEFAULT_API_WRAPPER_OPTIONS, USER_AGENT } from '../constants'
import makeTokenRequest from './oauthTokenRequest'

jest.mock('cross-fetch')

const getMockedResponse = (accessToken: string, refreshToken: string) => ({
  headers: new Map([['application/json', 'charset= utf-8']]),
  json: () => ({
    access_token: accessToken,
    expires_in: 14400,
    refresh_token: refreshToken,
    scope: 'user:profile',
    token_type: 'Bearer',
  }),
  ok: true,
  status: 200,
})

const { clientId, username, password } = DEFAULT_API_WRAPPER_OPTIONS

const defaultParams = {
  client_id: clientId!,
  grant_type: 'any',
  password: username!,
  username: password!,
}

describe('makeTokenRequest', () => {
  it('fetches supplied URL with params and return tokens', async () => {
    const resolvedAccessToken = '1234'
    const resolvedRefreshToken = '5678'
    ;(fetch as jest.Mock).mockResolvedValueOnce(
      getMockedResponse(resolvedAccessToken, resolvedRefreshToken),
    )

    const { accessToken, refreshToken } = await makeTokenRequest(
      'allthings://oauth/token',
      defaultParams,
    )

    expect(fetch).toBeCalledWith('allthings://oauth/token', {
      body: querystring.stringify(defaultParams),
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
      method: 'POST',
      mode: 'cors',
    })

    expect(accessToken).toBe(resolvedAccessToken)
    expect(refreshToken).toBe(resolvedRefreshToken)
  })

  it('throws HTTP status - statusText error when request fails with status other than 200', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: () => null,
      status: 400,
      statusText: 'bad request',
    })

    await expect(
      makeTokenRequest('allthings://oauth/token', defaultParams),
    ).rejects.toThrow('HTTP 400 — bad request. Could not get token')
  })

  it('throws original error if it has no .status', async () => {
    const error = new Error('error when getting body')
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: () => {
        throw error
      },
      status: 200,
    })

    await expect(
      makeTokenRequest('allthings://oauth/token', defaultParams),
    ).rejects.toThrow('there')
  })
})
