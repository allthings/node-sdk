import { EntityResultList, EnumLocale, IAllthingsRestClient } from '../types'
import {
  UtilisationPeriodResult,
  UtilisationPeriodResults,
} from './utilisationPeriod'

export enum EnumGender {
  female = 'female',
  male = 'male',
}

export enum EnumUserType {
  allthingsUser = 'allthings_user',
  allthingsContent = 'allthings_content',
  customer = 'customer',
  demoContent = 'demo_content',
  demoPublic = 'demo_public',
  partner = 'partner',
}

export enum EnumCommunicationPreferenceChannel {
  push = 'push',
  email = 'email',
}

export interface IUser {
  readonly communicationPreferences: ReadonlyArray<{
    readonly channels: ReadonlyArray<EnumCommunicationPreferenceChannel>
    readonly event: string
  }>
  readonly createdAt: string
  readonly deletionRequestedAt: string | null
  readonly description: string
  readonly email: string
  readonly emailValidated: boolean
  readonly externalId: string | null
  readonly gender: EnumGender
  readonly id: string
  readonly inviteEmailSent: boolean
  readonly lastLogin: string | null
  readonly locale: EnumLocale
  readonly nativeAppInstallIds: ReadonlyArray<string> | null
  readonly passwordChanged: boolean
  readonly phoneNumber: string | null
  readonly profileImage: string | null
  readonly properties: ReadonlyArray<string> | null
  readonly publicProfile: boolean
  readonly receiveAdminNotifications: boolean
  readonly roles: ReadonlyArray<string>
  readonly tenantIds: { readonly [key: string]: string }
  readonly type: EnumUserType | null
  readonly username: string
  readonly readOnly: boolean
}

export type PartialUser = Partial<IUser>

export type UserResult = Promise<IUser>
export type UserResultList = EntityResultList<IUser>

export enum EnumUserPermissionRole {
  appAdmin = 'app-admin',
  appOwner = 'app-owner',
  articlesAgent = 'articles-agent',
  articlesViewOnly = 'articles-view-only',
  bookableAssetAgent = 'bookable-asset-agent',
  bookingAgent = 'booking-agent',
  cockpitManager = 'cockpit-manager',
  dataConnectorAdmin = 'data-connector-admin',
  documentAdmin = 'doc-admin',
  externalAgent = 'external-agent',
  globalOrgAdmin = 'global-org-admin',
  globalUserAdmin = 'global-user-admin',
  orgAdmin = 'org-admin',
  orgTeamManager = 'org-team-manager',
  pinboardAgent = 'pinboard-agent',
  platformOwner = 'platform-owner',
  qa = 'qa',
  serviceCenterAgent = 'service-center-agent',
  serviceCenterManager = 'service-center-manager',
  setup = 'setup',
  tenantManager = 'tenant-manager',
}

export enum EnumUserPermissionObjectType {
  app = 'App',
  group = 'Group',
  property = 'Property',
  unit = 'Unit',
}

export interface IUserPermission {
  readonly id: string
  readonly label: string
  readonly restricted: boolean
  readonly restrictions: ReadonlyArray<object>
  readonly role: string
  readonly objectId: string
  readonly objectType: EnumUserPermissionObjectType
  readonly startDate?: Date
  readonly endDate?: Date
}

export type PartialUserPermission = Partial<IUserPermission>

export type UserPermissionResult = Promise<IUserPermission>

const remapUserResult = (user: any) => {
  const { tenantIDs: tenantIds, ...result } = user

  return { ...result, tenantIds }
}

export const remapEmbeddedUser = (embedded: {
  readonly [key: string]: any
}): ReadonlyArray<IUser> =>
  embedded.users ? embedded.users.map(remapUserResult) : []

/*
  Create new user
*/

export type MethodUserCreate = (
  appId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
    readonly plainPassword?: string
  },
) => UserResult

export async function userCreate(
  client: IAllthingsRestClient,
  appId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
    readonly plainPassword?: string
  },
): UserResult {
  return client.post('/v1/users', {
    ...data,
    creationContext: appId,
    username,
  })
}

/*
  Get a list of users
*/

export type MethodGetUsers = (
  page?: number,
  limit?: number,
  filter?: Record<string, any>,
) => UserResultList

export async function getUsers(
  client: IAllthingsRestClient,
  page = 1,
  limit = -1,
  filter = {},
): UserResultList {
  const {
    _embedded: { items: users },
    total,
  } = await client.get('/v1/users', {
    filter: JSON.stringify(filter),
    limit,
    page,
  })

  return { _embedded: { items: users.map(remapUserResult) }, total }
}

/*
  Get the current user from active session
*/

export type MethodGetCurrentUser = () => UserResult

export async function getCurrentUser(client: IAllthingsRestClient): UserResult {
  return remapUserResult(await client.get('/v1/me'))
}

/*
  Get a user by their ID
*/

export type MethodUserGetById = (id: string) => UserResult

export async function userGetById(
  client: IAllthingsRestClient,
  userId: string,
): UserResult {
  return remapUserResult(await client.get(`/v1/users/${userId}`))
}

/*
  Update a user by their ID
*/

export type MethodUserUpdateById = (
  userId: string,
  data: PartialUser,
) => UserResult

export async function userUpdateById(
  client: IAllthingsRestClient,
  userId: string,
  data: PartialUser,
): UserResult {
  const { tenantIds: tenantIDs, ...rest } = data

  return remapUserResult(
    await client.patch(`/v1/users/${userId}`, { ...rest, tenantIDs }),
  )
}

/*
  Create a new permission for a user
*/

export type MethodUserCreatePermission = (
  userId: string,
  permission: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly role: EnumUserPermissionRole
    readonly startDate?: Date
    readonly endDate?: Date
  },
) => UserPermissionResult

export async function userCreatePermission(
  client: IAllthingsRestClient,
  userId: string,
  data: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly role: EnumUserPermissionRole
    readonly startDate?: Date
    readonly endDate?: Date
  },
): UserPermissionResult {
  const { objectId: objectID, ...rest } = data
  const { objectID: resultObjectId, ...result } = await client.post(
    `/v1/users/${userId}/permissions`,
    {
      ...rest,
      objectID,
    },
  )

  return {
    ...result,
    objectId: resultObjectId,
  }
}

/*
  Create a new permission for a user
*/

export type MethodUserCreatePermissionBatch = (
  userId: string,
  permissions: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly roles: ReadonlyArray<EnumUserPermissionRole>
    readonly startDate?: Date
    readonly endDate?: Date
  },
) => Promise<boolean>

export async function userCreatePermissionBatch(
  client: IAllthingsRestClient,
  userId: string,
  permissions: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly roles: ReadonlyArray<EnumUserPermissionRole>
    readonly startDate?: Date
    readonly endDate?: Date
  },
): Promise<boolean> {
  const { objectId, objectType, roles, startDate, endDate } = permissions

  const batch = {
    batch: roles.map((role) => ({
      endDate: endDate && endDate.toISOString(),
      objectID: objectId,
      objectType,
      restrictions: [],
      role,
      startDate: startDate && startDate.toISOString(),
    })),
  }

  return !(await client.post(`/v1/users/${userId}/permissions`, batch))
}

/*
  Get a list of a user's permissions
*/

export type MethodUserGetPermissions = (
  userId: string,
) => Promise<ReadonlyArray<IUserPermission>>

export async function userGetPermissions(
  client: IAllthingsRestClient,
  userId: string,
): Promise<ReadonlyArray<IUserPermission>> {
  const {
    _embedded: { items: permissions },
  } = await client.get(`/v1/users/${userId}/roles?limit=-1`)

  return permissions.map(({ objectID: objectId, ...result }: any) => ({
    ...result,
    objectId,
  }))
}

/*
  Delete a user permission by Id
*/

export type MethodUserDeletePermission = (
  permissionId: string,
) => Promise<boolean>

export async function userDeletePermission(
  client: IAllthingsRestClient,
  permissionId: string,
): Promise<boolean> {
  return !(await client.delete(`/v1/permissions/${permissionId}`))
}

/*
  Get a list of utilisationPeriods a user is checked in to
*/

export type MethodUserGetUtilisationPeriods = (
  userId: string,
) => UtilisationPeriodResults

export async function userGetUtilisationPeriods(
  client: IAllthingsRestClient,
  userId: string,
): UtilisationPeriodResults {
  const {
    _embedded: { items: utilisationPeriods },
  } = await client.get(`/v1/users/${userId}/utilisation-periods`)

  return utilisationPeriods
}

/*
  Checkin a user into a Utilisation-Period with userId and
  utilisation-periodId
*/

export type MethodUserCheckInToUtilisationPeriod = (
  userId: string,
  utilisationPeriodId: string,
) => UtilisationPeriodResults

export async function userCheckInToUtilisationPeriod(
  client: IAllthingsRestClient,
  userId: string,
  utilisationPeriodId: string,
): UtilisationPeriodResult {
  const { email: userEmail } = await client.userGetById(userId)

  return client.utilisationPeriodCheckInUser(utilisationPeriodId, {
    email: userEmail,
  })
}

/*
  Get a user by email
 */

export type MethodUserGetByEmail = (email: string) => UserResultList

export async function userGetByEmail(
  client: IAllthingsRestClient,
  email: string,
  page = 1,
  limit = 1000,
): UserResultList {
  return client.getUsers(page, limit, { email })
}

/*
  Change a user's password
*/

export type MethodUserChangePassword = (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => Promise<boolean>

export async function userChangePassword(
  client: IAllthingsRestClient,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  return !(await client.put(`/v1/users/${userId}/password`, {
    currentPassword,
    plainPassword: newPassword,
  }))
}
