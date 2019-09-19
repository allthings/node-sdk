// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID } from '../../../test/constants'
import { createUserAndClient } from '../../../test/helpers'
import { EnumTimezone } from '../types'
import { EnumUserRelationType } from './userRelation'
const apiRestClient = restClient()
const testRole1 = 'facility manager'
const testRole2 = 'gardener'

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
    expect(userRelation.responsibilities[0].properties).toHaveLength(2)
    expect(userRelation.responsibilities[0].properties).toContain(property1.id)
    expect(userRelation.responsibilities[0].properties).toContain(property2.id)
  })

  it('should be able to create user relations with different roles', async () => {
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
      properties: [property1.id],
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    const userRelation = await apiRestClient.userRelationCreate(user.id, {
      properties: [property2.id],
      role: testRole2,
      type: EnumUserRelationType.isResponsible,
    })

    expect(userRelation.user).toBe(user.id)
    expect(userRelation.type).toBe(EnumUserRelationType.isResponsible)
    expect(userRelation.responsibilities).toHaveLength(2)

    expect(userRelation.responsibilities[0].role).toBe(testRole1)
    expect(userRelation.responsibilities[0].properties).toHaveLength(1)
    expect(userRelation.responsibilities[0].properties).toContain(property1.id)

    expect(userRelation.responsibilities[1].role).toBe(testRole2)
    expect(userRelation.responsibilities[1].properties).toHaveLength(1)
    expect(userRelation.responsibilities[1].properties).toContain(property2.id)
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
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    const userRelation = await apiRestClient.userRelationDelete(user.id, {
      properties: [property1.id],
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    expect(userRelation.user).toBe(user.id)
    expect(userRelation.type).toBe(EnumUserRelationType.isResponsible)
    expect(userRelation.responsibilities).toHaveLength(1)
    expect(userRelation.responsibilities[0].properties).toHaveLength(1)
    expect(userRelation.responsibilities[0].properties).toEqual([property2.id])
  })
})
