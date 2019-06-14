import fetch from 'cross-fetch'
import querystring from 'query-string'
import { USER_AGENT } from '../constants'
import makeLogger from '../utils/logger'
import { IOAuthToken } from './base'

const logger = makeLogger('OAuth Token Request')

const makeFetchTokenRequester = (url: string) => async (
  params: IndexSignature,
): Promise<IOAuthToken> => {
  try {
    const response = await fetch(url, {
      body: querystring.stringify(params),
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        // OAuth 2 requires request content-type to be
        // application/x-www-form-urlencoded
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
      method: 'POST',
      mode: 'cors',
    })

    if (response.status !== 200) {
      throw response
    }

    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: expiresIn,
    } = await response.json()

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      ...(expiresIn ? { expiresAt: Date.now() + expiresIn * 1000 } : {}),
    }
  } catch (error) {
    if (!error.status) {
      throw error
    }

    const errorName = `HTTP ${error.status} — ${error.statusText}`

    // tslint:disable-next-line:no-expression-statement
    logger.error(errorName, error.response)

    throw new Error(
      `HTTP ${error.status} — ${error.statusText}. Could not get token.`,
    )
  }
}

export default makeFetchTokenRequester