// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

let sharedGroupId: string // tslint:disable-line no-let

const client = restClient()

const testData = {
  name: 'Foobar Unit',
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
    const data = { ...testData, externalId: generateId() }
    const result = await client.unitCreate(sharedGroupId, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
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

    const updateData = {
      externalId: generateId(),
      type: EnumUnitType.owned,
    }

    const result = await client.unitUpdateById(unit.id, updateData)

    expect(result.type).toEqual(updateData.type)
    expect(result.externalId).toEqual(updateData.externalId)
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
