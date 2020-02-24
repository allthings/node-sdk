// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { createUserAndClient } from '../../../test/helpers'
import { EnumResource, EnumTimezone } from '../types'
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
      ids: [property1.id, property2.id],
      level: EnumResource.property,
      readOnly: true,
      role: 'my-role',
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
      ids: [property1.id],
      level: EnumResource.property,
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    const userRelation = await apiRestClient.userRelationCreate(user.id, {
      ids: [property2.id],
      level: EnumResource.property,
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
      ids: [property1.id, property2.id],
      level: EnumResource.property,
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    const userRelation = await apiRestClient.userRelationDelete(user.id, {
      ids: [property1.id],
      level: EnumResource.property,
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })

    expect(userRelation.user).toBe(user.id)
    expect(userRelation.type).toBe(EnumUserRelationType.isResponsible)
    expect(userRelation.responsibilities).toHaveLength(1)
    expect(userRelation.responsibilities[0].properties).toHaveLength(1)
    expect(userRelation.responsibilities[0].properties).toEqual([property2.id])
  })

  it('should be able to fetch a user`s responsibilities (jobRoles/relations)', async () => {
    const { user } = await createUserAndClient()
    const prop1 = 'Foobar Property'
    const property1 = await apiRestClient.propertyCreate(APP_ID, {
      name: prop1,
      timezone: EnumTimezone.EuropeBerlin,
    })
    const group1 = await apiRestClient.groupCreate(property1.id, {
      name: 'Foobar Group1',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })
    await apiRestClient.userRelationCreate(user.id, {
      ids: [property1.id],
      level: EnumResource.property,
      role: testRole1,
      type: EnumUserRelationType.isResponsible,
    })
    const createdUserRelations = await apiRestClient.userRelationCreate(user.id, {
      ids: [group1.id],
      level: EnumResource.group,
      role: testRole2,
      type: EnumUserRelationType.isResponsible,
    })

    const userRelations = await apiRestClient.userRelationsGetByUser(user.id)

    expect(userRelations._embedded.items).toHaveLength(1)
    expect(userRelations._embedded.items[0].id).toEqual(createdUserRelations.id)
    expect(userRelations._embedded.items[0].user).toEqual(user.id)
    expect(userRelations._embedded.items[0].responsibilities).toHaveLength(2)
    expect(userRelations._embedded.items[0].responsibilities[0]).toEqual(
      expect.objectContaining({
        groups: [],
        id: createdUserRelations.responsibilities[0].id,
        properties: [property1.id],
        role: testRole1,
      }),
    )
    expect(userRelations._embedded.items[0].responsibilities[1]).toEqual(
      expect.objectContaining({
        groups: [group1.id],
        id: createdUserRelations.responsibilities[1].id,
        properties: [],
        role: testRole2,
      }),
    )
  })
})
