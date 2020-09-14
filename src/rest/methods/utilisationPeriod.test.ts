// tslint:disable:no-expression-statement
import { nanoid as generateId } from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumLocale, EnumTimezone } from '../types'
import { EnumUnitType } from './unit'
import { remapEmbeddedUser } from './user'
import { EnumUtilisationPeriodType } from './utilisationPeriod'

let sharedUnitId: string // tslint:disable-line no-let
let sharedUtilisationPeriodId: string // tslint:disable-line no-let

const client = restClient()

describe('utilisationPeriodCreate()', () => {
  beforeAll(async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'Foobar Property',
      timezone: EnumTimezone.EuropeBerlin,
    })

    const group = await client.groupCreate(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.unitCreate(group.id, {
      name: 'Foobar Unit',
      type: EnumUnitType.rented,
    })

    sharedUnitId = unit.id // tslint:disable-line no-expression-statement
  })

  it('should be able to create a new utilisation period', async () => {
    const data = {
      endDate: '2050-01-01',
      externalId: generateId(),
      readOnly: true,
      startDate: '2050-01-01',
      type: EnumUtilisationPeriodType.tenant,
    }
    const result = await client.utilisationPeriodCreate(sharedUnitId, data)

    expect(result.startDate).toEqual(data.startDate)
    expect(result.endDate).toEqual(data.endDate)
    expect(result.type).toEqual(data.type)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('utilisationPeriodGetById()', () => {
  it('should be able to get a utilisation period by ID', async () => {
    const data = {
      endDate: '2050-01-02',
      externalId: generateId(),
      startDate: '2050-01-02',
    }
    const { id } = await client.utilisationPeriodCreate(sharedUnitId, data)
    const result = await client.utilisationPeriodGetById(id)

    expect(result.startDate).toEqual(data.startDate)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('utilisationPeriodUpdateById()', () => {
  it('should be able to update a utilisation period by ID', async () => {
    const initialData = {
      endDate: '2050-01-03',
      externalId: generateId(),
      startDate: '2050-01-03',
    }
    const utilisationPeriod = await client.utilisationPeriodCreate(
      sharedUnitId,
      initialData,
    )

    expect(utilisationPeriod.endDate).toEqual(initialData.endDate)
    expect(utilisationPeriod.externalId).toEqual(initialData.externalId)

    const updateData = {
      endDate: '2100-01-02',
      externalId: generateId(),
      startDate: '2100-01-01',
    }

    const result = await client.utilisationPeriodUpdateById(
      utilisationPeriod.id,
      updateData,
    )

    expect(result.startDate).toEqual(updateData.startDate)
    expect(result.endDate).toEqual(updateData.endDate)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})

describe('utilisationPeriodCheckInUser()', () => {
  it('should checkIn an existing user to a utilisationPeriod by email', async () => {
    const initialData = {
      endDate: '2450-01-03',
      externalId: generateId(),
      startDate: '2449-01-03',
    }
    const utilisationPeriod = await client.utilisationPeriodCreate(
      sharedUnitId,
      initialData,
    )

    const userEmail = generateId() + '@test.com'

    const user = await client.userCreate(APP_ID, generateId(), {
      company: APP_PROPERTY_MANAGER_ID,
      email: userEmail,
      locale: EnumLocale.de_DE,
      plainPassword: generateId(),
    })

    const {
      users: [{ id: checkedInUserId }],
    } = await client.utilisationPeriodCheckInUser(utilisationPeriod.id, {
      email: userEmail,
    })

    const [
      { id: usersUtilisationPeriodId },
    ] = await client.userGetUtilisationPeriods(user.id)

    const checkedInUtilisationPeriod = await client.utilisationPeriodGetById(
      usersUtilisationPeriodId,
    )

    expect(Array.isArray(checkedInUtilisationPeriod.users)).toEqual(true)

    expect(checkedInUtilisationPeriod.users[0]).toHaveProperty('tenantIds')
    expect(user.id).toEqual(checkedInUserId)
    expect(usersUtilisationPeriodId).toEqual(utilisationPeriod.id)
  })

  describe('utilisationPeriodCheckOutUser()', () => {
    it('should remove an existing user from a utilisationPeriod', async () => {
      const initialData = {
        endDate: '2999-01-03',
        externalId: generateId(),
        startDate: '2999-01-03',
      }
      const utilisationPeriod = await client.utilisationPeriodCreate(
        sharedUnitId,
        initialData,
      )

      const userEmail = generateId() + '@test.com'

      const user = await client.userCreate(APP_ID, generateId(), {
        company: APP_PROPERTY_MANAGER_ID,
        email: userEmail,
        locale: EnumLocale.de_DE,
        plainPassword: generateId(),
      })

      await client.utilisationPeriodCheckInUser(utilisationPeriod.id, {
        email: userEmail,
      })

      const checkOutResult = await client.utilisationPeriodCheckOutUser(
        utilisationPeriod.id,
        user.id,
      )

      expect(checkOutResult).toEqual(true)

      const emptyUtilisationPeriod = await client.utilisationPeriodGetById(
        utilisationPeriod.id,
      )
      expect(emptyUtilisationPeriod.users).toHaveLength(0)
      expect(remapEmbeddedUser(emptyUtilisationPeriod.users)).toEqual([])
    })
  })
})

describe('utilisationPeriodAddRegistrationCode()', () => {
  beforeAll(async () => {
    const initialData = {
      endDate: '2050-01-03',
      externalId: generateId(),
      startDate: '2050-01-03',
    }
    const utilisationPeriod = await client.utilisationPeriodCreate(
      sharedUnitId,
      initialData,
    )

    expect(utilisationPeriod.endDate).toEqual(initialData.endDate)
    expect(utilisationPeriod.externalId).toEqual(initialData.externalId)
    expect(utilisationPeriod.id).toBeDefined()

    sharedUtilisationPeriodId = utilisationPeriod.id // tslint:disable-line no-expression-statement
  })

  it('should be able to add registration code by utilisation period ID', async () => {
    const registrationCode = Date.now().toString()
    const result = await client.utilisationPeriodAddRegistrationCode(
      sharedUtilisationPeriodId,
      registrationCode,
    )

    expect(result.code).toEqual(registrationCode)
  })

  it('should be able to add registration code by utilisation period ID with tenant and permanent', async () => {
    const registrationCode = Date.now().toString()
    const tenant = {
      email: 'tenant@allthings.me',
      name: 'Teo Tenant',
      phone: '0123456789',
    }

    const result = await client.utilisationPeriodAddRegistrationCode(
      sharedUtilisationPeriodId,
      registrationCode,
      tenant,
      true,
    )

    expect(result.code).toEqual(registrationCode)
    expect(result.tenant).toEqual(tenant)
    expect(result.permanent).toBe(true)
  })
  describe('utilisationPeriodDelete()', () => {
    it('should be able to delete an utilsation period by its id', async () => {
      const utilisationPeriod = await client.utilisationPeriodCreate(
        sharedUnitId,
        {
          endDate: '2051-01-03',
          externalId: generateId(),
          startDate: '2051-01-03',
        },
      )

      const resultBeforeDeletion = await client.utilisationPeriodGetById(
        utilisationPeriod.id,
      )
      expect(resultBeforeDeletion.id).toEqual(utilisationPeriod.id)

      const deletedResult = await client.utilisationPeriodDelete(
        utilisationPeriod.id,
      )
      const resultAfterDeletion = client.utilisationPeriodGetById(
        utilisationPeriod.id,
      )

      expect(deletedResult).toBeTruthy()
      await expect(resultAfterDeletion).rejects.toThrow('404')
    })
  })
})
