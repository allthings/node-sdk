// tslint:disable:no-expression-statement
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { getNewTokenUsingPasswordGrant } from './oauth'

const redirectUri = 'allthings://redirect'

describe('getNewTokenUsingPasswordGrant() integration', () => {
  it('should return a token given valid credentials', async () => {
    const response = await getNewTokenUsingPasswordGrant({
      ...DEFAULT_API_WRAPPER_OPTIONS,
      redirectUri,
    })

    expect(response).toBeTruthy()
    expect(response).toHaveProperty('accessToken')
    expect(response).toHaveProperty('refreshToken')
    expect(response && typeof response.accessToken).toBe('string')
    expect(response && typeof response.refreshToken).toBe('string')
  })

  it('should not return a token if clientSecret is not specified', async () => {
    await expect(
      getNewTokenUsingPasswordGrant({
        ...DEFAULT_API_WRAPPER_OPTIONS,
        clientSecret: undefined,
        redirectUri,
      }),
    ).rejects.toThrow('Could not get token')
  })
})
