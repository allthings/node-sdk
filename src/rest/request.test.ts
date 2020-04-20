// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'

import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import createTokenStore from '../oauth/createTokenStore'
import maybeUpdateToken from '../oauth/maybeUpdateToken'
import { until } from '../utils/functional'
import request, { makeApiRequest } from './request'

beforeEach(() => {
  jest.resetModules()
  jest.resetAllMocks()
})

jest.mock('cross-fetch')
jest.mock('../oauth/maybeUpdateToken')

const mockFetch = fetch as jest.Mock
const mockmaybeUpdateToken = maybeUpdateToken as jest.Mock
const mockTokenStore = createTokenStore()

const mockTokenResult = {
  accessToken: '5c4092ed6a9a44fece13bd73',
  refreshToken: '5c4092ef6a9a44fece13bd74',
}

beforeEach(() => {
  mockTokenStore.set(mockTokenResult)
})

const fakeOauthTokenFetcher = async (): Promise<typeof mockTokenResult> =>
  mockTokenResult

describe('Request', () => {
  it('should not get the headers, when in browser', async () => {
    await makeApiRequest(
      mockTokenStore,
      fakeOauthTokenFetcher,
      {} as any,
      'get',
      '',
      {
        body: {
          formData: {
            a: 'b',
            c: 'd',
          },
        },
        query: {},
      },
    )(0, 0)
  })

  it('should use customer headers when passed', async () => {
    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'text/json']]),
      ok: true,
      status: 200,
    })

    await makeApiRequest(
      mockTokenStore,
      fakeOauthTokenFetcher,
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      '',
      {
        headers: { 'x-man': 'universe' },
      },
    )({}, 0)

    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.dev.allthings.me/api',
      {
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${mockTokenResult.accessToken}`,
          'content-type': 'application/json',
          'user-agent': 'Allthings Node SDK REST Client/0.0.0-development',
          'x-man': 'universe',
        },
        method: 'GET',
        mode: 'cors',
      },
    )
  })

  it('should throw when options.requestMaxRetries reached', async () => {
    await expect(
      until(
        () => false,
        makeApiRequest(
          mockTokenStore,
          fakeOauthTokenFetcher,
          {
            ...DEFAULT_API_WRAPPER_OPTIONS,
            requestBackOffInterval: 0,
            requestMaxRetries: 2,
          } as any,
          'get',
          '',
          { query: {} },
        ),
        { status: 503 },
        1,
      ),
    ).rejects.toThrow('Maximum number of retries reached')
  })

  it('should throw when response is not JSON or HTTP 204', async () => {
    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'text/html']]),
      ok: true,
      status: 200,
    })

    const error = await makeApiRequest(
      mockTokenStore,
      fakeOauthTokenFetcher,
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      '',
    )({}, 0)

    expect(() => {
      throw error
    }).toThrow('Response content type was "text/html" but expected JSON')
  })

  it('should should call maybeUpdateToken with mustRefresh argument is previous status was 401', async () => {
    const options = DEFAULT_API_WRAPPER_OPTIONS
    await makeApiRequest(
      mockTokenStore,
      fakeOauthTokenFetcher,
      options,
      'get',
      '',
    )(
      {
        status: 401,
      },
      1,
    )

    expect(mockmaybeUpdateToken).toBeCalledWith(
      mockTokenStore,
      expect.any(Function),
      options,
      true,
    )
  })

  it('should respect existing ? in url', async () => {
    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'text/json']]),
      ok: true,
      status: 200,
    })

    await makeApiRequest(
      mockTokenStore,
      fakeOauthTokenFetcher,
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      '/foo?bar=1',
      {
        query: { limit: '1' },
      },
    )({}, 0)

    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.dev.allthings.me/api/foo?bar=1&limit=1',
      {
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${mockTokenResult.accessToken}`,
          'content-type': 'application/json',
          'user-agent': 'Allthings Node SDK REST Client/0.0.0-development',
        },
        method: 'GET',
        mode: 'cors',
      },
    )
  })

  it('should return raw result object when parameter set', async () => {
    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'application/json']]),
      json: () => ({ foo: 'bar' }),
      ok: true,
      status: 200,
    })

    const response = await request(
      mockTokenStore,
      fakeOauthTokenFetcher,
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      '',
      undefined,
      true,
    )

    expect(response).toHaveProperty('status')
    expect(response).toHaveProperty('body')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ foo: 'bar' })
  })

  it('should return raw result object when parameter set and api returns an error', async () => {
    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'application/json']]),
      ok: false,
      status: 400,
      statusText: 'Bad request',
      text: () => '{"foo":"bar"}',
    })

    const response = await request(
      mockTokenStore,
      fakeOauthTokenFetcher,
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      '',
      undefined,
      true,
    )

    expect(response).toHaveProperty('status')
    expect(response).toHaveProperty('body')
    expect(response.status).toEqual(400)
    expect(response.body).toEqual('400 Bad request\n\n{"foo":"bar"}')
  })
})
