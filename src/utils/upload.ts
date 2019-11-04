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
