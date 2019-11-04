// tslint:disable:no-expression-statement

import generateId from 'nanoid'
import restClient from '../index'
import { uploadFiles } from './ticket'

const client = restClient()

const fileCreateSpy = jest.spyOn(client, 'fileCreate')

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

describe('uploadFiles()', () => {
  it('should include the images on successful upload', async () => {
    // tslint:disable readonly-array
    const ids: string[] = []

    fileCreateSpy.mockImplementation(
      () =>
        new Promise(resolve => {
          const id = generateId()
          // tslint:disable no-array-mutation
          ids.push(id)
          resolve({
            id,
          } as any)
        }),
    )

    const result = await uploadFiles(
      [
        { filename: 'file1', content: '' as any },
        { filename: 'file2', content: '' as any },
        { filename: 'file3', content: '' as any },
      ],
      client,
    )

    expect(fileCreateSpy).toBeCalledTimes(3)
    expect(result).toEqual(ids)
    jest.clearAllMocks()
  })

  it('should return successful uploads if one fails', async () => {
    // tslint:disable readonly-array
    const ids: string[] = []

    // tslint:disable-next-line no-let
    let count = 0

    fileCreateSpy.mockImplementation(
      () =>
        new Promise(resolve => {
          count++

          // make the 2nd upload throw an error
          if (count !== 2) {
            const id = generateId()
            // tslint:disable no-array-mutation
            ids.push(id)
            resolve({
              id,
            } as any)
          } else {
            throw new Error('Uh oh!')
          }
        }),
    )

    const result = await uploadFiles(
      [
        { filename: 'file1', content: '' as any },
        { filename: 'file2', content: '' as any },
        { filename: 'file3', content: '' as any },
      ],
      client,
    )

    expect(fileCreateSpy).toBeCalledTimes(3)
    expect(result).toEqual(ids)
    expect(result.length).toBe(2)
    jest.clearAllMocks()
  })
})
