import { EnumCountryCode, IAllthingsRestClient } from '../types'

export interface IGroup {
  readonly address: Partial<{
    readonly city: string | null
    readonly country: EnumCountryCode | null
    readonly houseNumber: string | null
    readonly latitude: number | null
    readonly longitude: number | null
    readonly postalCode: string | null
    readonly street: string | null
    readonly type: string | null
  }>
  readonly description: string | null
  readonly externalId: string | null
  readonly id: string
  readonly propertyManagerId: string
  readonly name: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
    readonly occupancy: number | null
    readonly unitCount: number | null
    readonly inhabitedUnits: number | null
  }
}

export type PartialGroup = Partial<IGroup>

export type GroupResult = Promise<IGroup>

/*
  Create new group
  https://api-doc.allthings.me/#!/Groups/post_properties_propertyID_groups
*/

export type MethodGroupCreate = (
  propertyId: string,
  data: PartialGroup & {
    readonly name: string
    readonly propertyManagerId: string
  },
) => GroupResult

export async function groupCreate(
  client: IAllthingsRestClient,
  propertyId: string,
  data: PartialGroup & {
    readonly name: string
    readonly propertyManagerId: string
  },
): GroupResult {
  const { propertyManagerId, ...rest } = data

  return client.post(`/v1/properties/${propertyId}/groups`, {
    ...rest,
    propertyManagerID: propertyManagerId,
  })
}

/*
  Get a group by its ID
  https://api-doc.allthings.me/#!/Groups/get_groups_groupID
*/

export type MethodGroupGetById = (id: string) => GroupResult

export async function groupGetById(
  client: IAllthingsRestClient,
  groupId: string,
): GroupResult {
  const { propertyManagerID: propertyManagerId, ...result } = await client.get(
    `/v1/groups/${groupId}`,
  )

  return { ...result, propertyManagerId }
}

/*
  Update a group by its ID
  https://api-doc.allthings.me/#!/Groups/patch_groups_groupID
*/

export type MethodGroupUpdateById = (
  groupId: string,
  data: PartialGroup,
) => GroupResult

export async function groupUpdateById(
  client: IAllthingsRestClient,
  groupId: string,
  data: PartialGroup,
): GroupResult {
  return client.patch(`/v1/groups/${groupId}`, data)
}
