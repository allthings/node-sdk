// tslint:disable:no-expression-statement
import { nanoid as generateId } from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumUnitObjectType, EnumUnitType } from './unit'

let sharedGroupId: string // tslint:disable-line no-let

const client = restClient()

const testData = {
  name: 'Foobar Unit',
  propertyOwner: 'Owner',
  readOnly: true,
  type: EnumUnitType.rented,
}

describe('unitCreate()', () => {
  beforeAll(async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'Foobar Property',
      timezone: 'Europe/Berlin',
    })

    const group = await client.groupCreate(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    sharedGroupId = group.id // tslint:disable-line no-expression-statement
  })

  it('should be able to create a new unit', async () => {
    const data = {
      ...testData,
      externalId: generateId(),
      objectType: EnumUnitObjectType.flat,
      size: 20.0,
    }
    const result = await client.unitCreate(sharedGroupId, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
    expect(result.objectType).toEqual(data.objectType)
    expect(result.size).toEqual(data.size)
  })
})

describe('unitGetById()', () => {
  it('should be able to get a unit by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await client.unitCreate(sharedGroupId, data)
    const result = await client.unitGetById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('unitUpdateById()', () => {
  it('should be able to update a unit by ID', async () => {
    const initialData = { ...testData, externalId: generateId() }
    const unit = await client.unitCreate(sharedGroupId, initialData)

    expect(unit.name).toEqual(initialData.name)
    expect(unit.externalId).toEqual(initialData.externalId)
    expect(unit.objectType).toBe(null)
    expect(unit.size).toBe(null)

    const updateData = {
      externalId: generateId(),
      objectType: EnumUnitObjectType.garage,
      size: 32.5,
      type: EnumUnitType.owned,
    }

    const result = await client.unitUpdateById(unit.id, updateData)

    expect(result.type).toEqual(updateData.type)
    expect(result.externalId).toEqual(updateData.externalId)
    expect(result.objectType).toEqual(updateData.objectType)
    expect(result.size).toEqual(updateData.size)
  })
})

describe('getUnits()', () => {
  it('should be able to get a list of units', async () => {
    const limit = 3

    const result = await client.getUnits()
    expect(result._embedded).toHaveProperty('items')

    const result2 = await client.getUnits(1, limit)
    expect(result2._embedded.items).toHaveLength(limit)
  })
})
