// tslint:disable:no-expression-statement
import { nanoid as generateId } from 'nanoid'
import restClient from '..'
import { APP_ID } from '../../../test/constants'
import {
  EnumCountryCode,
  EnumLookupUserType,
  EnumResource,
  EnumServiceProviderType,
} from '../types'

const client = restClient()

describe('lookupIds()', () => {
  it('should be able to look up a single id given an id string', async () => {
    const result = await client.lookupIds(APP_ID, {
      externalIds: 'foobar',
      resource: EnumResource.property,
    })

    expect(result).toEqual({
      foobar: null,
    })
  })

  it('should be able to look up an array of ids', async () => {
    const result = await client.lookupIds(APP_ID, {
      externalIds: ['foo', 'bar', 'foobar'],
      resource: EnumResource.group,
    })

    expect(result).toEqual({
      bar: null,
      foo: null,
      foobar: null,
    })
  })

  it('should be able to lookup up service-providers with parent', async () => {
    const serviceProviderParent = await client.serviceProviderCreate({
      externalId: generateId(),
      name: 'Parent',
      type: EnumServiceProviderType.propertyManager,
    })

    const serviceProvider = await client.serviceProviderCreate({
      address: {
        city: 'Freiburg',
        country: EnumCountryCode.DE,
        houseNumber: '1337a',
        postalCode: '79112',
        street: 'street',
      },
      email: 'foo@bar.de',
      externalId: generateId(),
      name: 'Foobar Property-manager',
      parent: serviceProviderParent.id,
      phoneNumber: '+493434343343',
      type: EnumServiceProviderType.craftspeople,
    })

    const result = await client.lookupIds(APP_ID, {
      externalIds: [serviceProvider.externalId],
      parentId: serviceProviderParent.id,
      resource: EnumResource.serviceProvider,
    })

    expect(result).toEqual({
      [serviceProvider.externalId]: serviceProvider.id,
    })
  })

  it('should be able to either lookup just a user or explicitly a tenant or an agent', async () => {
    expect(
      await client.lookupIds(APP_ID, {
        externalIds: ['fooAgent'],
        resource: EnumResource.user,
        userType: EnumLookupUserType.agent,
      }),
    ).toEqual({
      fooAgent: null,
    })

    expect(
      await client.lookupIds(APP_ID, {
        externalIds: ['fooTenant'],
        resource: EnumResource.user,
        userType: EnumLookupUserType.tenant,
      }),
    ).toEqual({
      fooTenant: null,
    })

    expect(
      await client.lookupIds(APP_ID, {
        externalIds: ['fooUser'],
        resource: EnumResource.user,
      }),
    ).toEqual({
      fooUser: null,
    })
  })
})
