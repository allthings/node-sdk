// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_ID } from '../../../test/constants'

const client = restClient()

const testData = {
  name: 'Foobar Property',
  timezone: 'Europe/Berlin',
}

describe('propertyCreate()', () => {
  it('should be able to create a new property', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await client.propertyCreate(APP_ID, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('propertyGetById()', () => {
  it('should be able to get a property by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await client.propertyCreate(APP_ID, data)
    const result = await client.propertyGetById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('propertyUpdateById()', () => {
  it('should be able to update a property by ID', async () => {
    const initialData = { ...testData, externalId: generateId() }
    const property = await client.propertyCreate(APP_ID, initialData)

    expect(property.name).toEqual(initialData.name)
    expect(property.externalId).toEqual(initialData.externalId)

    const updateData = {
      externalId: generateId(),
      name: 'Bio Vegan Gluten Free Property',
    }
    const result = await client.propertyUpdateById(property.id, updateData)

    expect(result.name).toEqual(updateData.name)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
