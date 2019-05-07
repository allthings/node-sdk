import { IAllthingsRestClient } from '../types'

export type FileResult = Promise<IFile>

interface IFileUrl {
  readonly url: string
  readonly size: number
  readonly width: number
  readonly height: number
}

export interface IFile {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly size: number
  readonly description: string
  readonly originalFilename: string
  readonly extension: string
  readonly category: string
  readonly path: string
  readonly deletedAt: string
  readonly files: {
    readonly original: IFileUrl
    readonly big: IFileUrl
    readonly medium: IFileUrl
    readonly small: IFileUrl
    readonly thumb: IFileUrl
  }
}

export type MethodFileCreate = (data: {
  readonly file: Blob | Buffer | ReadableStream
  readonly name: string
  readonly path?: string
}) => FileResult
export async function fileCreate(
  client: IAllthingsRestClient,
  data: {
    readonly file: Blob | Buffer | ReadableStream
    readonly name: string
    readonly path?: string
  },
): FileResult {
  return client.post('/v1/files', {
    formData: {
      file: [data.file, data.name],
      path: data.path || '',
    },
  })
}

export type MethodFileDelete = (fileId: string) => Promise<boolean>
export async function fileDelete(
  client: IAllthingsRestClient,
  fileId: string,
): Promise<boolean> {
  return (await client.delete(`/v1/files/${fileId}`)) === ''
}
