import { IAllthingsRestClient } from '..'
import { IFile } from '../rest/methods/file'

/**
 * Create many files
 *
 * Creates many files returning an array of id of successfully created files
 * and error objects for files that could not be created
 */
export const createManyFiles = async (
  attachments: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>,
  apiClient: IAllthingsRestClient,
): Promise<ReadonlyArray<IFile | Error>> => {
  const responses = await Promise.all(
    attachments.map(async attachment => {
      try {
        const result = await apiClient.fileCreate({
          file: attachment.content,
          name: attachment.filename,
        })

        return result
      } catch (error) {
        return error
      }
    }),
  )

  return responses
}

/**
 * Create many files sorted
 *
 * Creates many files and returns the id's of the successfully created files
 * and an array of errors of failed creations
 */
export async function createManyFilesSorted(
  files: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>,
  client: IAllthingsRestClient,
): Promise<{
  readonly success: ReadonlyArray<string>
  readonly error: ReadonlyArray<Error>
}> {
  const result = await createManyFiles(files, client)

  return {
    error: result.filter((item): item is Error => item instanceof Error),
    success: result
      .filter((item): item is IFile => !(item instanceof Error))
      .map(item => item.id),
  }
}
