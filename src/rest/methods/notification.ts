import { InterfaceAllthingsRestClient } from '../types'

export interface INotification {
  readonly category: 'welcome' | 'admin-message'
  readonly createdAt: string
  readonly id: string
  readonly objectID: string
  readonly read: boolean
  readonly referencedObjectID?: string
  readonly title: string
  readonly type: 'community-article'
}

interface IPagedResult {
  readonly limit: number
  readonly page: number
  readonly pages: number
  readonly total: number
  readonly _embedded: {
    readonly items: ReadonlyArray<any>
  }
  readonly _links: {
    readonly first: {
      readonly href: string
    }
    readonly last: {
      readonly href: string
    }
    readonly self: {
      readonly href: string
    }
  }
}

export type NotificationResult = Promise<INotification>
export interface IPagedNotificationResult extends IPagedResult {
  readonly _embedded: {
    readonly items: ReadonlyArray<INotification>
  }
}

export type PagedNotificationResult = Promise<IPagedNotificationResult>

export interface IGetNotificationsOptions {
  // readonly limit: string <-- this is what I like to have
  readonly [parameter: string]: string
}

export type MethodUserGetNotifications = (
  userId: string,
) => PagedNotificationResult

export async function userGetNotifications(
  client: InterfaceAllthingsRestClient,
  userId: string,
  options: IGetNotificationsOptions,
): PagedNotificationResult {
  return client.get(`/v1/users/${userId}/notifications`, options)
}

export type MethodNotificationMarkRead = (
  notificationId: string,
) => Promise<boolean>

export async function notificationMarkRead(
  client: InterfaceAllthingsRestClient,
  notificationId: string,
): Promise<boolean> {
  return !(await client.patch(`/v1/notifications/${notificationId}`, {
    read: true,
  }))
}

export type MethodUserMarkNotificationsRead = (
  notificationId: string,
) => Promise<boolean>

export async function userMarkNotificationsRead(
  client: InterfaceAllthingsRestClient,
  userId: string,
): Promise<boolean> {
  return !(await client.patch(`/v1/users/${userId}/notifications`, {
    lastReadAt: new Date().toISOString(),
  }))
}
