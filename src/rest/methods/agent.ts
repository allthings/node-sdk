import { EnumLocale, IAllthingsRestClient } from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
  IUserPermission,
  PartialUser,
  UserResult,
} from './user'

export type AgentPermissionsResult = Promise<ReadonlyArray<IUserPermission>>

/*
  Create new agent
*/

export type MethodAgentCreate = (
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
  externalAgentCompany?: string,
) => UserResult

export async function agentCreate(
  client: IAllthingsRestClient,
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
  externalAgentCompany?: string,
): UserResult {
  const user = await client.userCreate(appId, username, {
    ...data,
    company: propertyManagerId,
    type: EnumUserType.agent,
  })

  const manager = externalAgentCompany
    ? await client.post(`/v1/property-managers/${propertyManagerId}/users`, {
        externalAgentCompany,
        userID: user.id,
      })
    : undefined

  return {
    ...user,
    ...(manager && { manager }),
  }
}

/*
  Create agent permissions.
  This is a convenience wrapper around createUserPermission.
*/
/**
 * Returns a datastore-specific object of redis clients.
 */
export type MethodAgentCreatePermissions = (
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
  permissions: ReadonlyArray<EnumUserPermissionRole>,
  startDate?: Date,
  endDate?: Date,
) => Promise<boolean>

/**
 * Returns a datastore-specific object of redis clients.
 */
export async function agentCreatePermissions(
  client: IAllthingsRestClient,
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
  permissions: ReadonlyArray<EnumUserPermissionRole>,
  startDate?: Date,
  endDate?: Date,
): Promise<boolean> {
  return client.userCreatePermissionBatch(agentId, {
    endDate,
    objectId,
    objectType,
    restrictions: [],
    roles: permissions,
    startDate,
  })
}
