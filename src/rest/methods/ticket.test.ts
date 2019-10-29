// tslint:disable:no-expression-statement

// import generateId from 'nanoid'
import restClient from '..'

const client = restClient()

const userId = '5a9d5ce40ecb3300492bf186'
const utilisationPeriodId = '5a9d65cd0ecb330045742be3'
const categoryId = '5728504906128762098b456e'

describe('ticketGetById()', () => {
  it('should be able to get a ticket by ID', async () => {
    const { id } = await client.ticketCreate(userId, utilisationPeriodId, {
      category: categoryId,
      description: 'description',
      title: 'title',
    })
    const result = await client.ticketGetById(id)

    expect(result.id).toEqual(id)
    expect(result.description).toEqual('description')
    expect(result.title).toEqual('title')
  })
})

describe('ticketCreate()', () => {
  it('should be able to create a ticket', async () => {
    const { description, title } = await client.ticketCreate(
      userId,
      utilisationPeriodId,
      { category: categoryId, description: 'description', title: 'title' },
    )

    expect(description).toEqual('description')
    expect(title).toEqual('title')
  })
})
