// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumCountryCode, EnumTimezone } from '../types'

const client = restClient()

const testPropertyData = {
  name: 'Foobar Group Property',
  timezone: EnumTimezone.EuropeBerlin,
}

const testData = {
  name: 'Foobar Group',
  propertyManagerId: APP_PROPERTY_MANAGER_ID,
  readOnly: true,
}

const testAddressData = {
  city: 'Springfield',
  country: EnumCountryCode.DE,
  houseNumber: '742',
  postalCode: '1111',
  street: 'Evergreen Terrace',
}

describe('groupCreate()', () => {
  it('should be able to create a new group', async () => {
    const property = await client.propertyCreate(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const result = await client.groupCreate(property.id, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('groupGetById()', () => {
  it('should be able to get a group by ID', async () => {
    const property = await client.propertyCreate(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const { id } = await client.groupCreate(property.id, data)
    const result = await client.groupGetById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('groupUpdateById()', () => {
  it('should be able to update a group by ID', async () => {
    const property = await client.propertyCreate(APP_ID, testPropertyData)

    const initialData = { ...testData, externalId: generateId() }

    const group = await client.groupCreate(property.id, initialData)

    expect(group.name).toEqual(initialData.name)
    expect(group.externalId).toEqual(initialData.externalId)

    const updateData = {
      address: { ...testAddressData },
      description: 'Bio Vegan Gluten Free Group',
      externalId: generateId(),
    }

    const result = await client.groupUpdateById(group.id, updateData)

    expect(result.address.country).toEqual(EnumCountryCode.DE)
    expect(result.description).toEqual(updateData.description)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})

describe('getGroups()', () => {
  it('should be able to get a list of groups', async () => {
    const limit = 3

    const result = await client.getGroups()
    expect(result._embedded).toHaveProperty('items')

    const result2 = await client.getGroups(1, limit)
    expect(result2._embedded.items).toHaveLength(limit)
  })
})
