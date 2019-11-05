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
 * Create many files without erroring
 *
 * Creates many files and returns the id's of only the successfully created files
 * Useful in a case such as creating a ticket where it should not fail to create
 * the ticket and should include successful attachments even if a file creation fails
 */
export async function createManyFilesWithoutErroring(
  files: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>,
  client: IAllthingsRestClient,
): Promise<ReadonlyArray<string>> {
  const result = await createManyFiles(files, client)

  return result
    .filter((item): item is IFile => !(item instanceof Error))
    .map(item => item.id)
}
