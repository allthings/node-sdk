// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'
import querystring from 'query-string'
import { DEFAULT_API_WRAPPER_OPTIONS, USER_AGENT } from '../constants'
import makeFetchTokenRequester from './makeFetchTokenRequester'

jest.mock('cross-fetch')

const mockFetch = fetch as jest.Mock

const getMockedResponse = (
  accessToken: string,
  refreshToken: string,
  expiresIn?: number,
) => ({
  headers: new Map([['application/json', 'charset= utf-8']]),
  json: () => ({
    access_token: accessToken,
    ...(expiresIn ? { expires_in: expiresIn } : {}),
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
const resolvedExpiresIn = 60 * 60

describe('makeFetchTokenRequester', () => {
  it('fetches supplied URL with params and return tokens', async () => {
    mockFetch.mockResolvedValueOnce(
      getMockedResponse(resolvedAccessToken, resolvedRefreshToken),
    )

    const { accessToken, refreshToken } = await makeFetchTokenRequester(
      'allthings://oauth/token',
    )(defaultParams)

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

  it('returns token with expiresIn if expires_in was provided in response', async () => {
    mockFetch.mockResolvedValueOnce(
      getMockedResponse(
        resolvedAccessToken,
        resolvedRefreshToken,
        resolvedExpiresIn,
      ),
    )

    const { expiresIn } = await makeFetchTokenRequester(
      'allthings://oauth/token',
    )(defaultParams)

    expect(expiresIn).toBe(resolvedExpiresIn)
  })

  it('throws HTTP status - statusText error when request fails with status other than 200', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => null,
      status: 400,
      statusText: 'bad request',
    })

    await expect(
      makeFetchTokenRequester('allthings://oauth/token')(defaultParams),
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
      makeFetchTokenRequester('allthings://oauth/token')(defaultParams),
    ).rejects.toThrow('error when reading response body')
  })
})
