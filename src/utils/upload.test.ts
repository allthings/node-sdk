// tslint:disable:no-expression-statement
import { nanoid as generateId } from 'nanoid'
import restClient from '../rest/index'
import { createManyFilesSorted } from './upload'

const client = restClient()

const fileCreateSpy = jest.spyOn(client, 'fileCreate')

afterEach(jest.clearAllMocks)

describe('createManyFilesWithoutErroring()', () => {
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

    const result = await createManyFilesSorted(
      [
        { filename: 'file1', content: '' as any },
        { filename: 'file2', content: '' as any },
        { filename: 'file3', content: '' as any },
      ],
      client,
    )

    expect(fileCreateSpy).toBeCalledTimes(3)
    expect(result.success).toEqual(ids)
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

    const result = await createManyFilesSorted(
      [
        { filename: 'file1', content: '' as any },
        { filename: 'file2', content: '' as any },
        { filename: 'file3', content: '' as any },
      ],
      client,
    )

    expect(fileCreateSpy).toBeCalledTimes(3)
    expect(result.success).toEqual(ids)
    expect(result.success.length).toBe(2)
    expect(result.error.length).toBe(1)
  })
})
