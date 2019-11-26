import { IAllthingsRestClient } from '../types'

export type BucketResult = Promise<IBucket>

export interface IBucket {
  readonly id: string
  readonly channels: ReadonlyArray<string>
  readonly files: ReadonlyArray<string>
  readonly name: string
}

export type MethodBucketGet = (bucketId: string) => BucketResult

export async function bucketGet(
  client: IAllthingsRestClient,
  bucketId: string,
): BucketResult {
  return client.get(`/v1/buckets/${bucketId}`)
}

export type MethodBucketCreate = (data: {
  readonly channels: ReadonlyArray<string>
  readonly name: string
}) => BucketResult

export async function bucketCreate(
  client: IAllthingsRestClient,
  data: {
    readonly channels: ReadonlyArray<string>
    readonly name: string
  },
): BucketResult {
  return client.post('/v1/buckets', {
    channels: data.channels,
    name: data.name,
  })
}

export type MethodBucketAddFile = (
  bucketId: string,
  fileId: string,
) => Promise<boolean>
export async function bucketAddFile(
  client: IAllthingsRestClient,
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  return (
    (await client.post(`/v1/buckets/${bucketId}/files`, {
      id: fileId,
    })) === ''
  )
}

export type MethodBucketRemoveFile = (
  bucketId: string,
  fileId: string,
) => Promise<boolean>
export async function bucketRemoveFile(
  client: IAllthingsRestClient,
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  return (await client.delete(`/v1/buckets/${bucketId}/files/${fileId}`)) === ''
}

export type MethodBucketRemoveFilesInPath = (
  bucketId: string,
  data: { readonly path: string },
) => Promise<boolean>
export async function bucketRemoveFilesInPath(
  client: IAllthingsRestClient,
  bucketId: string,
  data: { readonly path: string },
): Promise<boolean> {
  return (
    (await client.delete(`/v1/buckets/${bucketId}/files`, {
      folder: data.path,
    })) === ''
  )
}
