// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { EnumCountryCode } from '../types'
import { EnumPropertyManagerType } from './propertyManager'

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
  type: EnumPropertyManagerType.craftsPeople,
}

describe('propertyManagerCreate()', () => {
  it('should be able to create a new property-manager', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await client.propertyManagerCreate(data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('propertyManagerGetById()', () => {
  it('should be able to get a property by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await client.propertyManagerCreate(data)
    const result = await client.propertyManagerGetById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('propertyUpdateById()', () => {
  it('should be able to update a property by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const propertyManager = await client.propertyManagerCreate(data)

    expect(propertyManager.name).toEqual(data.name)
    expect(propertyManager.externalId).toEqual(data.externalId)

    const updateData = {
      externalId: generateId(),
      name: 'Bio craftspeople',
    }
    const result = await client.propertyManagerUpdateById(
      propertyManager.id,
      updateData,
    )

    expect(result.name).toEqual(updateData.name)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
