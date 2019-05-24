// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { until } from '../utils/functional'
import { getNewTokenUsingPasswordGrant } from './oauth'
import request, { HttpVerb, makeApiRequest } from './request'
import { IAllthingsRestClientOptions } from './types'

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
          { requestMaxRetries: 2, requestBackOffInterval: 0 } as any,
          'get',
          '',
          '',
          '',
          { query: {} },
        ),
        { statusCode: 503 },
        1,
      ),
    ).rejects.toThrow('Maximum number of retries reached')
  })

  it('should get an oauth token on request from implicit grant', async () => {
    // get a legit access token with the password grant, so we can mock it in the implicit flow
    const accessToken = await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    // tslint:disable-next-line:no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: {
        hash: `access_token=${accessToken}`,
        href: '',
        origin: '',
      },
    }

    const response = await request(
      DEFAULT_API_WRAPPER_OPTIONS,
      'get' as HttpVerb,
      '/v1/me',
    )

    expect(typeof response).toBe('object')
    expect(response).toHaveProperty('_embedded')
  })

  it('should redirect to the oauth url in a window context', async () => {
    // tslint:disable-next-line:no-object-mutation
    global.window = {
      history: { replaceState: () => null },
      location: { hash: '', href: '', origin: '' },
    }

    // tslint:enable no-object-mutation
    const clientOptions: IAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      apiUrl: '',
    }

    await expect(
      request(clientOptions, 'get' as HttpVerb, '/v1/me'),
    ).rejects.toThrow('Unable to get OAuth2 authentication token.')

    expect(global.window.location.href).toBeTruthy()
    expect(global.window.location.href).toContain(clientOptions.oauthUrl)
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
})
