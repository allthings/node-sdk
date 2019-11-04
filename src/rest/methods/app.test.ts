// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { APP_ID, USER_ID } from '../../../test/constants'

const client = restClient()

describe('appCreate()', () => {
  it('should create a new App', async () => {
    const result = await client.appCreate(USER_ID, {
      name: generateId(),
      siteUrl: generateId(),
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
