// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'

const client = restClient()

const testData = {
  name: 'Foobar Property-manager',
}

describe('propertyCreate()', () => {
  it('should be able to create a new property-manager', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await client.propertyManagerCreate(data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})
