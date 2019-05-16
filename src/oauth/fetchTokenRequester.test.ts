// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'
import querystring from 'query-string'
import { DEFAULT_API_WRAPPER_OPTIONS, USER_AGENT } from '../constants'
import fetchTokenRequester from './fetchTokenRequester'

jest.mock('cross-fetch')

const mockFetch = fetch as jest.Mock

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

const resolvedAccessToken = '1234'
const resolvedRefreshToken = '5678'

describe('fetchTokenRequester', () => {
  it('fetches supplied URL with params and return tokens', async () => {
    mockFetch.mockResolvedValueOnce(
      getMockedResponse(resolvedAccessToken, resolvedRefreshToken),
    )

    const { accessToken, refreshToken } = await fetchTokenRequester(
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
    mockFetch.mockResolvedValueOnce({
      json: () => null,
      status: 400,
      statusText: 'bad request',
    })

    await expect(
      fetchTokenRequester('allthings://oauth/token', defaultParams),
    ).rejects.toThrow('HTTP 400 — bad request. Could not get token')
  })

  it('throws original error if it has no .status', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => {
        throw new Error('error when reading response body')
      },
      status: 200,
    })

    await expect(
      fetchTokenRequester('allthings://oauth/token', defaultParams),
    ).rejects.toThrow('error when reading response body')
  })
})
