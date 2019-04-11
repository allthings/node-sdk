// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID } from '../../../test/constants'
import { createUserAndClient } from '../../../test/helpers'
import { EnumTimezone, EnumUserRelationType } from '../types'

const apiRestClient = restClient()

describe('userRelationCreate()', () => {
  it('should be able to create a new user relation', async () => {
    const { user } = await createUserAndClient()
    const property1 = await apiRestClient.propertyCreate(APP_ID, {
      name: 'Foobar Property',
      timezone: EnumTimezone.EuropeBerlin,
    })
    const property2 = await apiRestClient.propertyCreate(APP_ID, {
      name: 'Foobar Property2',
      timezone: EnumTimezone.EuropeBerlin,
    })

    const userRelation = await apiRestClient.userRelationCreate(user.id, {
      properties: [property1.id, property2.id],
      type: EnumUserRelationType.isResponsible,
    })

    expect(userRelation.user).toBe(user.id)
    expect(userRelation.type).toBe(EnumUserRelationType.isResponsible)
    expect(userRelation.properties).toHaveLength(2)
    expect(userRelation.properties).toContain(property1.id)
    expect(userRelation.properties).toContain(property2.id)
  })

  it('should be able to delete a user relation', async () => {
    const { user } = await createUserAndClient()
    const property1 = await apiRestClient.propertyCreate(APP_ID, {
      name: 'Foobar Property',
      timezone: EnumTimezone.EuropeBerlin,
    })
    const property2 = await apiRestClient.propertyCreate(APP_ID, {
      name: 'Foobar Property2',
      timezone: EnumTimezone.EuropeBerlin,
    })
    await apiRestClient.userRelationCreate(user.id, {
      properties: [property1.id, property2.id],
      type: EnumUserRelationType.isResponsible,
    })

    const userRelation = await apiRestClient.userRelationDelete(user.id, {
      properties: [property1.id],
      type: EnumUserRelationType.isResponsible,
    })

    expect(userRelation.user).toBe(user.id)
    expect(userRelation.type).toBe(EnumUserRelationType.isResponsible)
    expect(userRelation.properties).toHaveLength(1)
    expect(userRelation.properties).toEqual([property2.id])
  })
})
