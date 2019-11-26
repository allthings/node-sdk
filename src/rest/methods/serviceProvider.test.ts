// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { EnumCountryCode, EnumServiceProviderType } from '../types'

const client = restClient()

const testData = {
  address: {
    city: 'Freiburg',
    country: EnumCountryCode.DE,
    houseNumber: '1337a',
    postalCode: '79112',
    street: 'street',
  },
  email: 'foo@bar.de',
  name: 'Foobar Property-manager',
  phoneNumber: '+493434343343',
  type: EnumServiceProviderType.craftspeople,
}

describe('serviceProviderCreate()', () => {
  it('should be able to create a new service provider', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await client.serviceProviderCreate(data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('serviceProviderGetById()', () => {
  it('should be able to get a service provider by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await client.serviceProviderCreate(data)
    const result = await client.serviceProviderGetById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('propertyUpdateById()', () => {
  it('should be able to update a service provider by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const serviceProviderParent = await client.serviceProviderCreate({
      externalId: generateId(),
      name: 'Parent',
    })
    const serviceProvider = await client.serviceProviderCreate({
      ...data,
      parent: serviceProviderParent.id,
    })

    expect(serviceProvider.name).toEqual(data.name)
    expect(serviceProvider.externalId).toEqual(data.externalId)

    const updateData = {
      externalId: generateId(),
      name: 'Bio craftspeople',
    }
    const result = await client.serviceProviderUpdateById(
      serviceProvider.id,
      updateData,
    )

    expect(result.name).toEqual(updateData.name)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
