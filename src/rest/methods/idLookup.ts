import { EnumLookupUserType, EnumResource, IAllthingsRestClient } from '../types'

export type LookupIdResult = Promise<{
  readonly [externalId: string]: string | null
}>

export type MethodLookupIds = (
  appId: string,
  data: {
    readonly resource: EnumResource
    readonly externalIds: string | ReadonlyArray<string>
    readonly parentId?: string
    readonly userType?: EnumLookupUserType
  },
) => LookupIdResult

// https://api-doc.allthings.me/#!/Id45Lookup/post_id_lookup_appID_resource
export async function lookupIds(
  client: IAllthingsRestClient,
  appId: string,
  data: {
    readonly resource: EnumResource
    readonly externalIds: string | ReadonlyArray<string>
    readonly parentId?: string
    readonly userType?: EnumLookupUserType
  },
): LookupIdResult {
  return client.post(`/v1/id-lookup/${appId}/${data.resource}`, {
    externalIds:
      typeof data.externalIds === 'string'
        ? [data.externalIds]
        : data.externalIds,
    ...(data.parentId ? { parentId: data.parentId } : {}),
    ...(data.userType ? { userType: data.userType } : {}),
  })
}
