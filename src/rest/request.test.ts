// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { IAuthorizationResponse } from '../oauth'
import { until } from '../utils/functional'
import { getNewTokenUsingPasswordGrant } from './oauth'
import {
  getTokenForRequest,
  makeApiRequest,
  responseWasSuccessful,
} from './request'

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

  it('should get an access token when only a refreshToken only is provided', async () => {
    const { refreshToken } = (await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )) as IAuthorizationResponse

    const token = await getTokenForRequest(
      {
        accessToken: 'any',
        apiUrl: DEFAULT_API_WRAPPER_OPTIONS.apiUrl,
        clientId: DEFAULT_API_WRAPPER_OPTIONS.clientId,
        clientSecret: DEFAULT_API_WRAPPER_OPTIONS.clientSecret,
        oauthUrl: DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
        refreshToken,
        requestBackOffInterval:
          DEFAULT_API_WRAPPER_OPTIONS.requestBackOffInterval,
        requestMaxRetries: DEFAULT_API_WRAPPER_OPTIONS.requestMaxRetries,
      },
      true,
    )

    expect(token).toHaveProperty('accessToken')
    expect(token).toHaveProperty('refreshToken')
  })

  it('should throw when response is not JSON or HTTP 204', async () => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('cross-fetch')

    const mockFetch = require('cross-fetch').default
    const mockMakeApiRequest = require('./request').makeApiRequest

    mockFetch.mockResolvedValueOnce({
      clone: () => ({ text: () => '' }),
      headers: new Map([['content-type', 'text/html']]),
      ok: true,
      status: 200,
    })

    const error = await mockMakeApiRequest(
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
      '',
      '',
    )({}, 0)

    expect(() => {
      throw error
    }).toThrow('Response content type was "text/html" but expected JSON')
  })

  it('should refresh the access token when the current one has expired', async () => {
    const { refreshToken } = (await getNewTokenUsingPasswordGrant({
      ...DEFAULT_API_WRAPPER_OPTIONS,
      state: 'test state',
    })) as IAuthorizationResponse

    const response = await until(
      responseWasSuccessful,
      makeApiRequest(
        {
          ...DEFAULT_API_WRAPPER_OPTIONS,
          clientId: DEFAULT_API_WRAPPER_OPTIONS.clientId,
          clientSecret: DEFAULT_API_WRAPPER_OPTIONS.clientSecret,
          oauthUrl: DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
          refreshToken,
          requestBackOffInterval: 0,
          requestMaxRetries: 10,
          scope: DEFAULT_API_WRAPPER_OPTIONS.scope,
        } as any,
        'get',
        '/v1/me',
      ),
    )

    expect(response).toHaveProperty('body')
    expect(response.status).toBe(200)
  })

  it('should refresh the access token when the current one has expired', async () => {
    const { refreshToken } = (await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )) as IAuthorizationResponse

    await expect(
      until(
        () => false,
        makeApiRequest(
          {
            ...DEFAULT_API_WRAPPER_OPTIONS,
            clientId: DEFAULT_API_WRAPPER_OPTIONS.clientId,
            oauthUrl: DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
            refreshToken,
            requestBackOffInterval: 0,
            requestMaxRetries: 2,
            scope: 'foobar-scope',
          } as any,
          'get',
          '/v1/me',
        ),
        { status: 401 },
        1,
      ),
    ).rejects.toThrow('Could not get token')
  })
})
