// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_PROPERTY_MANAGER_ID, USER_ID } from '../../../test/constants'
import { EnumTimezone } from '../types'
import { EnumUnitType } from './unit'

let sharedUtilisationPeriodIds: ReadonlyArray<string> // tslint:disable-line no-let

const client = restClient()

beforeAll(async () => {
  const name = `Registration Code ${generateId()}`
  const app = await client.appCreate(USER_ID, { name, siteUrl: generateId() })

  const property = await client.propertyCreate(app.id, {
    name,
    timezone: EnumTimezone.EuropeBerlin,
  })
  const group = await client.groupCreate(property.id, {
    name,
    propertyManagerId: APP_PROPERTY_MANAGER_ID,
  })
  const unit = await client.unitCreate(group.id, {
    name,
    type: EnumUnitType.rented,
  })

  sharedUtilisationPeriodIds = (await Promise.all([
    client.utilisationPeriodCreate(unit.id, {
      endDate: '2018-01-02',
      startDate: '2018-01-01',
    }),
    client.utilisationPeriodCreate(unit.id, {
      endDate: '2018-02-02',
      startDate: '2018-02-01',
    }),
    client.utilisationPeriodCreate(unit.id, {
      endDate: '2018-03-02',
      startDate: '2018-03-01',
    }),
  ])).map(item => item.id)
})

describe('registrationCodeCreate()', async () => {
  it('should be able to create a new registration code', async () => {
    const code = generateId()
    const testExternalId = generateId()

    const result = await client.registrationCodeCreate(
      code,
      sharedUtilisationPeriodIds,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    expect(result.id).toBeTruthy()
    expect(result.code).toEqual(code)
    expect(result.expiresAt).toEqual(null)
    expect(result.permanent).toBe(false)
    expect(result.externalId).toEqual(testExternalId)
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[1],
    )
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[2],
    )

    const singleUtilisationPeriod = await client.registrationCodeCreate(
      generateId(),
      sharedUtilisationPeriodIds[0],
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    expect(singleUtilisationPeriod.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )

    // test for default options parameter
    const emptyOptions = await client.registrationCodeCreate(
      generateId(),
      sharedUtilisationPeriodIds[0],
      undefined,
    )

    expect(emptyOptions.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
  })
})

describe('registrationCodeFindById()', async () => {
  it('should be able to find a registration code by id', async () => {
    const testExternalId = generateId()

    const createdRegistrationCode = await client.registrationCodeCreate(
      generateId(),
      sharedUtilisationPeriodIds,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    const foundRegistrationCode = await client.registrationCodeFindById(
      createdRegistrationCode.id,
    )

    expect(createdRegistrationCode.id).toBeTruthy()
    expect(foundRegistrationCode.id).toEqual(createdRegistrationCode.id)

    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[1],
    )
    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[2],
    )
  })
})

describe('registrationCodeDelete()', async () => {
  it('should delete a registrationCode', async () => {
    const testExternalId = generateId()

    const createdRegistrationCode = await client.registrationCodeCreate(
      generateId(),
      sharedUtilisationPeriodIds,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    const foundRegistrationCode = await client.registrationCodeFindById(
      createdRegistrationCode.id,
    )

    expect(createdRegistrationCode.id).toBeTruthy()
    expect(foundRegistrationCode.id).toEqual(createdRegistrationCode.id)

    const deletedResult = await client.registrationCodeDelete(
      createdRegistrationCode.id,
    )

    const wasRegCodeDeleted = client.registrationCodeFindById(
      createdRegistrationCode.id,
    )

    expect(deletedResult).toBeTruthy()
    await expect(wasRegCodeDeleted).rejects.toThrow('404')
  })
})
