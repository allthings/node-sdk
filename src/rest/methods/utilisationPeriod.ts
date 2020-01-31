import { IAllthingsRestClient } from '../types'
import {
  IRegistrationCodeTenant,
  remapRegistationCodeResult,
} from './registrationCode'
import { IUser, remapEmbeddedUser } from './user'

export enum EnumUtilisationPeriodType {
  tenant = 'tenant',
  ownership = 'ownership',
  vacant = 'vacant',
}

export interface IUtilisationPeriod {
  readonly _embedded: {
    readonly invitations: ReadonlyArray<any>
    readonly [key: string]: any
  }
  readonly endDate: string | null
  readonly externalId: string | null
  readonly id: string
  readonly invitations: ReadonlyArray<IUtilisationPeriodInvite>
  readonly name: string
  readonly startDate: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
  }
  readonly tenantIds: ReadonlyArray<string>
  readonly type: EnumUtilisationPeriodType
  readonly userCount: number | null
  readonly users: ReadonlyArray<IUser>
  readonly readOnly: boolean
}

export interface IUtilisationPeriodInvite {
  readonly id: string
  readonly code: string
  readonly createdAt: string
  readonly email: string | null
  readonly expiresAt: string | null
  readonly permanent: boolean
  readonly utilisationPeriods: ReadonlyArray<string>
  readonly invitationSent: boolean
  readonly externalId: string
  readonly organizations: ReadonlyArray<string> // array of mongoId
  readonly teams: ReadonlyArray<string> // array of mongoId
  readonly tenant: IRegistrationCodeTenant
  readonly resendAttempts: ReadonlyArray<string> // array of dates
  readonly usedAt: string | null
}

export type PartialUtilisationPeriod = Partial<IUtilisationPeriod>

export type UtilisationPeriodResult = Promise<IUtilisationPeriod>
export type UtilisationPeriodResults = Promise<
  ReadonlyArray<IUtilisationPeriod>
>

/*
  Create new Utilisation Period
*/

export type MethodUtilisationPeriodCreate = (
  unitId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
    readonly endDate?: string
    readonly type?: EnumUtilisationPeriodType
  },
) => UtilisationPeriodResult

export async function utilisationPeriodCreate(
  client: IAllthingsRestClient,
  unitId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
    readonly endDate?: string
    readonly type?: EnumUtilisationPeriodType
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, _embedded, ...result } = await client.post(
    `/v1/units/${unitId}/utilisation-periods`,
    data,
  )

  return {
    ...result,
    invitations: _embedded.invitations.map(remapRegistationCodeResult),
    tenantIds,
    users: remapEmbeddedUser(_embedded),
  }
}

/*
  Get a Utilisation Period by its ID
*/

export type MethodUtilisationPeriodGetById = (
  id: string,
) => UtilisationPeriodResult

export async function utilisationPeriodGetById(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, _embedded, ...result } = await client.get(
    `/v1/utilisation-periods/${utilisationPeriodId}`,
  )

  return {
    ...result,
    invitations: _embedded.invitations.map(remapRegistationCodeResult),
    tenantIds,
    users: remapEmbeddedUser(_embedded),
  }
}

/*
  Update a unit by its ID
*/

export type MethodUtilisationPeriodUpdateById = (
  unitId: string,
  data: PartialUtilisationPeriod,
) => UtilisationPeriodResult

export async function utilisationPeriodUpdateById(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, _embedded, ...result } = await client.patch(
    `/v1/utilisation-periods/${utilisationPeriodId}`,
    data,
  )

  return {
    ...result,
    invitations: _embedded.invitations.map(remapRegistationCodeResult),
    tenantIds,
    users: remapEmbeddedUser(_embedded),
  }
}

/*
  Delete a Utilisation Period by its ID
*/
export type MethodUtilisationPeriodDelete = (
  utilisationPeriodId: string,
) => Promise<boolean>

export async function utilisationPeriodDelete(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
): Promise<boolean> {
  return !(await client.delete(
    `/v1/utilisation-periods/${utilisationPeriodId}/soft`,
  ))
}

export type MethodUtilisationPeriodCheckInUser = (
  utilisationPeriodId: string,
  data: { readonly email: string },
) => UtilisationPeriodResult

export async function utilisationPeriodCheckInUser(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
  data: {
    readonly email: string
  },
): UtilisationPeriodResult {
  return (
    (await client.post(`/v1/utilisation-periods/${utilisationPeriodId}/users`, {
      email: data.email,
    })) && client.utilisationPeriodGetById(utilisationPeriodId)
  )
}

export type MethodUtilisationPeriodCheckOutUser = (
  utilisationPeriodId: string,
  userId: string,
) => UtilisationPeriodResult

export async function utilisationPeriodCheckOutUser(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
  userId: string,
): Promise<boolean> {
  return (
    (await client.delete(
      `/v1/utilisation-periods/${utilisationPeriodId}/users/${userId}`,
    )) === ''
  )
}

/*
  Add new registratation code by utilisation period
*/
export type MethodUtilisationPeriodAddRegistrationCode = (
  utilisationPeriodId: string,
  code: string,
  tenant?: IRegistrationCodeTenant,
  permanent?: boolean,
) => Promise<IUtilisationPeriodInvite>

export async function utilisationPeriodAddRegistrationCode(
  client: IAllthingsRestClient,
  utilisationPeriodId: string,
  code: string,
  tenant?: IRegistrationCodeTenant,
  permanent = false,
): Promise<IUtilisationPeriodInvite> {
  return client.post(
    `/v1/utilisation-periods/${utilisationPeriodId}/registration-codes`,
    { code, permanent, tenant },
  )
}
