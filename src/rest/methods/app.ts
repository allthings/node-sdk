import { IAllthingsRestClient } from '../types'

export interface IApp {
  readonly id: string
  readonly name: string
  readonly siteUrl: string
}

export type PartialApp = Partial<IApp>

export type AppResult = Promise<IApp>

export type CreateAppResult = Promise<IApp>

export type MethodAppCreate = (
  userId: string,
  data: PartialApp & {
    readonly name: string
    readonly siteUrl: string
  },
) => CreateAppResult

// @TODO: this is very much incomplete.
export async function appCreate(
  client: IAllthingsRestClient,
  userId: string,
  data: PartialApp & {
    readonly name: string
    readonly siteUrl: string
  },
): CreateAppResult {
  return client.post(`/v1/users/${userId}/apps`, {
    availableLocales: { '0': 'de_DE' },
    ...data,
    siteUrl: data.siteUrl.replace('_', ''),
  })
}

/*
  Get an app by its ID
*/

export type MethodAppGetById = (appId: string) => AppResult

export async function appGetById(
  client: IAllthingsRestClient,
  appId: string,
): AppResult {
  return client.get(`/v1/apps/${appId}`)
}
