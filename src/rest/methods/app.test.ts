// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID, USER_ID } from '../../../test/constants'
import { pseudoRandomString } from '../../utils/random'

const client = restClient()

describe('appCreate()', () => {
  it('should create a new App', async () => {
    const result = await client.appCreate(USER_ID, {
      name: pseudoRandomString(32),
      siteUrl: `https://${pseudoRandomString(32)}.info`,
    })

    expect(result).toBeTruthy()
  })
})

describe('appGetById()', () => {
  it('should get an app by id', async () => {
    const result = await client.appGetById(APP_ID)

    expect(result.id).toEqual(APP_ID)
  })
})

describe('activeUnitsGetByAppId()', () => {
  it('should get the number of active units of an app by id', async () => {
    const appWithUnits = await client.activeUnitsGetByAppId(APP_ID)

    expect(appWithUnits.id).toEqual(APP_ID)
    expect(appWithUnits.activeUnitCount).toBeGreaterThan(0)

    const cleanApp = await client.appCreate(USER_ID, {
      name: pseudoRandomString(32),
      siteUrl: `https://${pseudoRandomString(32)}.info`,
    })
    const appWithNoUnits = await client.activeUnitsGetByAppId(cleanApp.id)
    expect(appWithNoUnits.activeUnitCount).toEqual(0)
  })
})
