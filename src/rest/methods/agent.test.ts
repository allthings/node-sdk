// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumLocale, EnumTimezone } from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
} from './user'

const client = restClient()

const testData = {
  description: 'Foobar User',
  locale: EnumLocale.en_US,
}

describe('agentCreate()', () => {
  it('should be able to create a new agent', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      data,
    )

    const result = await client.userGetById(agent.id)

    expect(result.email).toEqual(data.email)
    expect(result.externalId).toEqual(data.externalId)
    expect(result.roles).toEqual([])
    expect(result.type).toEqual(EnumUserType.customer)

    const {
      _embedded: { items: managerAgents },
    } = await client.get(
      `/v1/property-managers/${APP_PROPERTY_MANAGER_ID}/users?limit=-1`,
    )

    const ourManagerAgent = managerAgents.find(
      (item: any) => item.id === agent.id,
    )

    expect(ourManagerAgent).toBeTruthy()
    expect(ourManagerAgent.email).toEqual(agent.email)
    expect(ourManagerAgent.externalId).toEqual(agent.externalId)
    expect(ourManagerAgent.roles).toEqual(agent.roles)
    expect(ourManagerAgent.type).toEqual(agent.type)
  })
})

describe('agentCreatePermissions()', () => {
  it('should be able to add agent permissions', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      data,
    )

    const agentAppPermissionResult = await client.agentCreatePermissions(
      agent.id,
      APP_ID,
      EnumUserPermissionObjectType.app,
      [EnumUserPermissionRole.appAdmin, EnumUserPermissionRole.pinboardAgent],
      new Date('2019-01-01T00:00:00Z'),
      new Date('2050-01-02T23:59:59Z'),
    )

    expect(agentAppPermissionResult).toBeTruthy()
    const property = await client.propertyCreate(APP_ID, {
      name: generateId(),
      timezone: EnumTimezone.EuropeBerlin,
    })

    const agentPropertyPermissionResult = await client.agentCreatePermissions(
      agent.id,
      property.id,
      EnumUserPermissionObjectType.property,
      [
        EnumUserPermissionRole.bookingAgent,
        EnumUserPermissionRole.articlesAgent,
      ],
    )

    expect(agentPropertyPermissionResult).toBeTruthy()

    const agentPermissions = await client.userGetPermissions(agent.id)
    expect(agentPermissions).toBeTruthy()
    expect(agentPermissions).toHaveLength(4)
    // expect each role to equal the ones we added
    agentPermissions.map(permission => {
      expect(
        [
          EnumUserPermissionRole.bookingAgent,
          EnumUserPermissionRole.articlesAgent,
          EnumUserPermissionRole.appAdmin,
          EnumUserPermissionRole.pinboardAgent,
        ].includes(permission.role as EnumUserPermissionRole),
      )
    })
    // expect appAdmin + pinboardAgent permissions to be timeboxed
    agentPermissions.map(permission => {
      if (
        [
          EnumUserPermissionRole.appAdmin,
          EnumUserPermissionRole.pinboardAgent,
        ].includes(permission.role as EnumUserPermissionRole)
      ) {
        expect(permission.startDate).toBeDefined()
        expect(permission.endDate).toBeDefined()
        expect(permission.startDate).toEqual('2019-01-01T00:00:00+0000')
        expect(permission.endDate).toEqual('2050-01-02T23:59:59+0000')
      }
    })
  })
})
