import { EnumUserRelationType, InterfaceAllthingsRestClient } from '../types'

export interface IUserRelation {
  readonly id: string
  readonly user: string
  readonly type: string
  readonly properties: ReadonlyArray<string>
}

export type UserRelationResult = Promise<IUserRelation>

export type MethodUserRelationCreate = (
  userId: string,
  type: EnumUserRelationType,
  data: {
    readonly properties: ReadonlyArray<string>
  },
) => UserRelationResult

export type MethodUserRelationDelete = (
  userId: string,
  type: EnumUserRelationType,
  data: {
    readonly properties: ReadonlyArray<string>
  },
) => UserRelationResult

// https://api-doc.allthings.me/#/User/Relations/post_users__userId__user_relations__type_
export async function userRelationCreate(
  client: InterfaceAllthingsRestClient,
  userId: string,
  type: EnumUserRelationType,
  data: {
    readonly properties: ReadonlyArray<string>
  },
): UserRelationResult {
  return client.post(`/v1/users/${userId}/user-relations/${type}`, {
    properties: data.properties,
  })
}

// https://api-doc.allthings.me/#/User/Relations/delete_users__userId__user_relations__type_
export async function userRelationDelete(
  client: InterfaceAllthingsRestClient,
  userId: string,
  type: EnumUserRelationType,
  data: {
    readonly properties: ReadonlyArray<string>
  },
): UserRelationResult {
  return client.delete(`/v1/users/${userId}/user-relations/${type}`, {
    properties: data.properties,
  })
}
