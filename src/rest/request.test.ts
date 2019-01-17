// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'

import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { until } from '../utils/functional'
import oauthObtainTokenFromClientOptions from './oauthObtainTokenFromClientOptions'
import oauthTokenRequest from './oauthTokenRequest'
import { makeApiRequest } from './request'

beforeEach(() => {
  jest.resetModules()
  jest.resetAllMocks()
})

jest.mock('cross-fetch')
jest.mock('./oauthObtainTokenFromClientOptions')

const mockFetch = fetch as jest.Mock
const mockOauthObtainTokenFromClientOptions = oauthObtainTokenFromClientOptions as jest.Mock

beforeEach(() => {
  mockOauthObtainTokenFromClientOptions.mockReturnValue({
    accessToken: '1234',
    refreshToken: '5678',
  })
})

describe('Request', () => {
  it('should not get the headers, when in browser', async () => {
    jest.resetModules()
    jest.resetAllMocks()

    jest.mock(
      'form-data',
      () =>
        // tslint:disable:no-class
        class FormDataMock {
          public readonly append = jest.fn()
        },
    )

    require('form-data')
    const mockMakeApiRequest = require('./request').makeApiRequest

    await mockMakeApiRequest({}, 'get', '', '', '', {
      body: {
        formData: {
          a: 'b',
          c: 'd',
        },
      },
      query: {},
    })(0, 0)
  })

  it('should use customer headers when passed', async () => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('cross-fetch')

    const mockFetch = require('cross-fetch').default
    const mockMakeApiRequest = require('./request').makeApiRequest

    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'text/json']]),
      ok: true,
      status: 200,
    })

    await mockMakeApiRequest(
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
      '',
      '',
      { headers: { 'x-man': 'universe' } },
    )({}, 0)

    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://accounts.dev.allthings.me/api',
      {
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer ',
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

    const error = await makeApiRequest(DEFAULT_API_WRAPPER_OPTIONS, 'get', '')(
      {},
      0,
    )

    expect(() => {
      throw error
    }).toThrow('Response content type was "text/html" but expected JSON')
  })

  it('should should call oauthObtainTokenFromClientOptions with mustRefresh argument is previous status was 401', async () => {
    const options = DEFAULT_API_WRAPPER_OPTIONS
    await makeApiRequest(options, 'get', '')(
      {
        status: 401,
      },
      1,
    )

    expect(mockOauthObtainTokenFromClientOptions).toBeCalledWith(
      oauthTokenRequest,
      options,
      true,
    )
  })
})
