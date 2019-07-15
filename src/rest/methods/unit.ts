import { EntityResultList, IAllthingsRestClient } from '../types'

export enum EnumUnitType {
  rented = 'rented',
  owned = 'owned',
}

export interface IUnit {
  readonly externalId: string | null
  readonly id: string
  readonly name: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
  }
  readonly type: EnumUnitType
  readonly readOnly: boolean
}

export type PartialUnit = Partial<IUnit>

export type UnitResult = Promise<IUnit>
export type UnitResultList = EntityResultList<IUnit>

/*
  Create new unit
*/

export type MethodUnitCreate = (
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
) => UnitResult

export async function unitCreate(
  client: IAllthingsRestClient,
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
): UnitResult {
  return client.post(`/v1/groups/${groupId}/units`, data)
}

/*
  Get a unit by its ID
*/

export type MethodUnitGetById = (id: string) => UnitResult

export async function unitGetById(
  client: IAllthingsRestClient,
  unitId: string,
): UnitResult {
  return client.get(`/v1/units/${unitId}`)
}

/*
  Update a unit by its ID
*/

export type MethodUnitUpdateById = (
  unitId: string,
  data: PartialUnit,
) => UnitResult

export async function unitUpdateById(
  client: IAllthingsRestClient,
  unitId: string,
  data: PartialUnit,
): UnitResult {
  return client.patch(`/v1/units/${unitId}`, data)
}

/*
  Get a list of units
*/

export type MethodGetUnits = (
  page?: number,
  limit?: number,
  filter?: IndexSignature,
) => UnitResultList

export async function getUnits(
  client: IAllthingsRestClient,
  page = 1,
  limit = -1,
  filter = {},
): UnitResultList {
  const {
    _embedded: { items: units },
    total,
  } = await client.get(
    `/v1/units?page=${page}&limit=${limit}&filter=${JSON.stringify(filter)}`,
  )

  return { _embedded: { items: units }, total }
}
