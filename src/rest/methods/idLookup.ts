import { EnumResource, IAllthingsRestClient } from '../types'

export type LookupIdResult = Promise<{
  readonly [externalId: string]: string | null
}>

export type MethodLookupIds = (
  appId: string,
  data: {
    readonly resource: EnumResource
    readonly externalIds: string | ReadonlyArray<string>
    readonly createdBy?: string
  },
) => LookupIdResult

// https://api-doc.allthings.me/#!/Id45Lookup/post_id_lookup_appID_resource
export async function lookupIds(
  client: IAllthingsRestClient,
  appId: string,
  data: {
    readonly resource: EnumResource
    readonly externalIds: string | ReadonlyArray<string>
    readonly createdBy?: string
  },
): LookupIdResult {
  return client.post(`/v1/id-lookup/${appId}/${data.resource}`, {
    externalIds:
      typeof data.externalIds === 'string'
        ? [data.externalIds]
        : data.externalIds,
    ...(data.createdBy ? { createdBy: data.createdBy } : {}),
  })
}
