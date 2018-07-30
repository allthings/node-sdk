// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
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
}

const testAddressData = {
  city: 'Springfield',
  country: EnumCountryCode.DE,
  houseNumber: '742',
  postalCode: '1111',
  street: 'Evergreen Terrace',
}

describe('createGroup()', () => {
  it('should be able to create a new group', async () => {
    const property = await client.propertyCreate(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const result = await client.groupCreate(property.id, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getGroupById()', () => {
  it('should be able to get a group by ID', async () => {
    const property = await client.propertyCreate(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const { id } = await client.groupCreate(property.id, data)
    const result = await client.groupFindById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateGroupById()', () => {
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
