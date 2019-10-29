import { IAllthingsRestClient } from '..'

export const upload = async (
  attachments: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>,
  apiClient: IAllthingsRestClient,
): Promise<ReadonlyArray<string>> => {
  const responses = await Promise.all(
    attachments.map(attachment =>
      apiClient.fileCreate({
        file: attachment.content,
        name: attachment.filename || 'attachment',
      }),
    ),
  )

  const fileIds: ReadonlyArray<string> = responses.map(response => response.id)

  return fileIds
}
