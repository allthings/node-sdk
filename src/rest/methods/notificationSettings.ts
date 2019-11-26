import { remapKeys } from '../../utils/object'
import { camelCaseToDash, dashCaseToCamel } from '../../utils/string'
import { IAllthingsRestClient } from '../types'

export interface INotificationSettings {
  readonly adminMessages: EnumNotificationSettingsValue
  readonly appDigestEmail: EnumNotificationSettingsValue
  readonly deals: EnumNotificationSettingsValue
  readonly events: EnumNotificationSettingsValue
  readonly hintsAndTips: EnumNotificationSettingsValue
  readonly localDeals: EnumNotificationSettingsValue
  readonly localEvents: EnumNotificationSettingsValue
  readonly lostAndFound: EnumNotificationSettingsValue
  readonly messages: EnumNotificationSettingsValue
  readonly miscellaneous: EnumNotificationSettingsValue
  readonly newThingsForSale: EnumNotificationSettingsValue
  readonly newThingsToGive: EnumNotificationSettingsValue
  readonly services: EnumNotificationSettingsValue
  readonly surveys: EnumNotificationSettingsValue
  readonly ticketDigestEmail: EnumNotificationSettingsValue
}

export enum EnumNotificationSettingsValue {
  never = 'never',
  immediately = 'immediately',
  daily = 'daily',
  weekly = 'weekly',
  biweekly = 'biweekly',
  monthly = 'monthly',
}

export type PartialNotificationSettings = Partial<INotificationSettings>

export type NotificationSettingsResult = Promise<INotificationSettings>

export type MethodNotificationSettingsUpdateByUser = (
  userId: string,
  data: PartialNotificationSettings,
) => NotificationSettingsResult

export async function notificationSettingsUpdateByUser(
  client: IAllthingsRestClient,
  userId: string,
  data: PartialNotificationSettings,
): NotificationSettingsResult {
  const result = await client.patch(
    `/v1/users/${userId}/notification-settings`,
    { notificationSettings: remapKeys(data, camelCaseToDash) },
  )

  return remapKeys(result, dashCaseToCamel) as INotificationSettings
}

export type MethodNotificationSettingsResetByUser = (
  userId: string,
) => NotificationSettingsResult

export async function notificationSettingsResetByUser(
  client: IAllthingsRestClient,
  userId: string,
): NotificationSettingsResult {
  const result = await client.delete(
    `/v1/users/${userId}/notification-settings`,
  )

  return remapKeys(result, dashCaseToCamel) as INotificationSettings
}
