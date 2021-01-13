// tslint:disable:no-expression-statement
import { nanoid as generateId } from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import {
  EnumCountryCode,
  EnumLocale,
  EnumServiceProviderType,
  EnumTimezone,
} from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
} from './user'

const client = restClient()

const testData = {
  description: 'Foobar User',
  locale: EnumLocale.en_US,
  readOnly: true,
}

describe('agentCreate()', () => {
  it('should be able to create a new agent and send an invitation per default', async () => {
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

    expect(result.inviteEmailSent).toBeTruthy()
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

  it('should be able to suppress sending an invitation on a new agent', async () => {
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
      false,
    )
    const result = await client.userGetById(agent.id)
    expect(result.inviteEmailSent).toBeFalsy()
  })

  it('should be able to create a new agent with a externalAgentCompany associated', async () => {
    const externalAgentCompanyData = {
      address: {
        city: 'Freiburg',
        country: EnumCountryCode.DE,
        houseNumber: '1337a',
        postalCode: '79112',
        street: 'street',
      },
      email: 'foo@bar.de',
      name: 'Foobar Property-manager',
      parent: APP_PROPERTY_MANAGER_ID,
      phoneNumber: '+493434343343',
      type: EnumServiceProviderType.craftspeople,
    }

    const payload = { ...externalAgentCompanyData, externalId: generateId() }
    const externalAgentCompany = await client.serviceProviderCreate(payload)

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
      true,
      externalAgentCompany.id,
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
      false,
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
        EnumUserPermissionRole.articlesViewOnly,
      ],
    )

    expect(agentPropertyPermissionResult).toBeTruthy()

    const agentPermissions = await client.userGetPermissions(agent.id)
    expect(agentPermissions).toBeTruthy()
    expect(agentPermissions).toHaveLength(5)
    // expect each role to equal the ones we added
    agentPermissions.map((permission) => {
      expect(
        [
          EnumUserPermissionRole.bookingAgent,
          EnumUserPermissionRole.articlesAgent,
          EnumUserPermissionRole.appAdmin,
          EnumUserPermissionRole.pinboardAgent,
          EnumUserPermissionRole.articlesViewOnly,
        ].includes(permission.role as EnumUserPermissionRole),
      )
    })
    // expect appAdmin + pinboardAgent permissions to be timeboxed
    agentPermissions.map((permission) => {
      if (
        [
          EnumUserPermissionRole.appAdmin,
          EnumUserPermissionRole.pinboardAgent,
        ].includes(permission.role as EnumUserPermissionRole)
      ) {
        expect(permission.startDate).toBeDefined()
        expect(permission.endDate).toBeDefined()
        expect(permission.startDate).toEqual('2019-01-01T00:00:00.000+0000')
        expect(permission.endDate).toEqual('2050-01-02T23:59:59.000+0000')
      }
    })
  })
})
