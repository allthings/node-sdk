import { dateToString, stringToDate } from '../../utils/stringToDate'
import { InterfaceAllthingsRestClient } from '../types'

export enum EnumNotificationCategory {
  events = 'events',
  hintsAndTips = 'hints-and-tips',
  lostAndFound = 'lost-and-found',
  localDeals = 'local-deals',
  localEvents = 'local-events',
  miscellaneous = 'miscellaneous',
  deals = 'deals',
  messages = 'messages',
  adminMessages = 'admin-messages',
  newThingsToGive = 'new-things-to-give',
  newThingsForSale = 'new-things-for-sale',
  surveys = 'surveys',
  supportOffer = 'support-offer',
  supportRequest = 'support-request',
  sustainability = 'sustainability',
  localServices = 'local-services',
  services = 'services',
  ticketDigestEmail = 'ticket-digest-email',
  appDigestEmail = 'app-digest-email',
  newFile = 'new-file',
}

export enum EnumNotificationType {
  clipboardThing = 'clipboard-thing',
  comment = 'comment',
  communityArticle = 'community-article',
  newFile = 'new-file',
  ticketComment = 'ticket-comment',
  welcomeNotification = 'welcome-notification',
}

export interface IBasicNotification {
  readonly category: EnumNotificationCategory
  readonly id: string
  readonly read: boolean
  readonly title: string
  readonly type: EnumNotificationType
}

export interface IPreprocessedNotification extends IBasicNotification {
  readonly createdAt: string
  readonly objectID: string
  readonly referencedObjectID: string | null
}

export interface INotification extends IBasicNotification {
  readonly createdAt: Date
  readonly objectId: string
  readonly referencedObjectId: string | null
}

function remapNotificationResult({
  createdAt,
  objectID,
  referencedObjectID,
  ...restNotification
}: IPreprocessedNotification): INotification {
  return {
    createdAt: stringToDate(createdAt),
    objectId: objectID,
    referencedObjectId: referencedObjectID,
    ...restNotification,
  }
}

export type NotificationResultList = Promise<{
  readonly _embedded: { readonly items: ReadonlyArray<INotification> }
  readonly total: number
  readonly metaData: { readonly unreadNotifications: number }
}>

export type MethodNotificationsGetByUser = (
  userId: string,
  page?: number,
  limit?: number,
) => NotificationResultList

export async function notificationsGetByUser(
  client: InterfaceAllthingsRestClient,
  userId: string,
  page = 1,
  limit = -1,
): NotificationResultList {
  const {
    _embedded: { items: notifications },
    total,
    metaData,
  } = await client.get(
    `/v1/users/${userId}/notifications?page=${page}&limit=${limit}`,
  )

  return {
    _embedded: { items: notifications.map(remapNotificationResult) },
    metaData,
    total,
  }
}

export type NotificationsUpdateReadByUserResult = Promise<null>

export type MethodNotificationsUpdateReadByUser = (
  userId: string,
  lastReadAt?: Date,
) => NotificationsUpdateReadByUserResult

export async function notificationsUpdateReadByUser(
  client: InterfaceAllthingsRestClient,
  userId: string,
  lastReadAt: Date = new Date(),
): NotificationsUpdateReadByUserResult {
  return client.patch(`/v1/users/${userId}/notifications`, {
    lastReadAt: dateToString(lastReadAt),
  })
}

export type NotificationUpdateReadResult = Promise<INotification>

export type MethodNotificationUpdateRead = (
  notificationId: string,
) => NotificationUpdateReadResult

export async function notificationUpdateRead(
  client: InterfaceAllthingsRestClient,
  notificationId: string,
): NotificationUpdateReadResult {
  return remapNotificationResult(
    await client.patch(`/v1/notifications/${notificationId}`, { read: true }),
  )
}
