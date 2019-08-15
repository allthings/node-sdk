import { IAllthingsRestClient } from '../types'

export interface IUserRelation {
  readonly id: string
  readonly user: string
  readonly type: string
  readonly responsibilities: ReadonlyArray<{
    readonly id: string
    readonly role: string
    readonly properties: ReadonlyArray<string>
  }>
}

export type UserRelationResult = Promise<IUserRelation>

export enum EnumUserRelationType {
  isResponsible = 'is-responsible',
}

export type MethodUserRelationCreate = (
  userId: string,
  data: {
    readonly properties: ReadonlyArray<string>
    readonly type: EnumUserRelationType
  },
) => UserRelationResult

export type MethodUserRelationDelete = (
  userId: string,
  data: {
    readonly properties: ReadonlyArray<string>
    readonly type: EnumUserRelationType
  },
) => UserRelationResult

// https://api-doc.allthings.me/#/User/Relations/post_users__userId__user_relations__type_
export async function userRelationCreate(
  client: IAllthingsRestClient,
  userId: string,
  data: {
    readonly properties: ReadonlyArray<string>
    readonly type: EnumUserRelationType
  },
): UserRelationResult {
  return client.post(`/v1/users/${userId}/user-relations/${data.type}`, {
    properties: data.properties,
  })
}

// https://api-doc.allthings.me/#/User/Relations/delete_users__userId__user_relations__type_
export async function userRelationDelete(
  client: IAllthingsRestClient,
  userId: string,
  data: {
    readonly properties: ReadonlyArray<string>
    readonly type: EnumUserRelationType
  },
): UserRelationResult {
  return client.delete(`/v1/users/${userId}/user-relations/${data.type}`, {
    properties: data.properties,
  })
}
