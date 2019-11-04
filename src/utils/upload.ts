import { IAllthingsRestClient } from '..'
import { IFile } from '../rest/methods/file'

export const upload = async (
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

export async function uploadFiles(
  files: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>,
  client: IAllthingsRestClient,
): Promise<ReadonlyArray<string>> {
  const result = await upload(files, client)

  return result
    .filter((item): item is IFile => !(item instanceof Error))
    .map(item => item.id)
}
