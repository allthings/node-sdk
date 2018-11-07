// tslint:disable:no-expression-statement
import restClient from '..'
import { EnumNotificationSettingsValue } from './notificationSettings'

const client = restClient()

describe('notificationSettingsUpdateByUser()', () => {
  it('should be able to update user notification settings', async () => {
    const { id } = await client.getCurrentUser()
    const result = await client.notificationSettingsUpdateByUser(id, {
      ticketDigestEmail: EnumNotificationSettingsValue.never,
    })

    expect(result.ticketDigestEmail).toBe(EnumNotificationSettingsValue.never)
  })
})

describe('notificationSettingsResetByUser()', () => {
  it('should be able to reset user notification settings to default', async () => {
    const { id } = await client.getCurrentUser()
    await client.notificationSettingsUpdateByUser(id, {
      ticketDigestEmail: EnumNotificationSettingsValue.never,
    })

    const result = await client.notificationSettingsResetByUser(id)

    expect(result.ticketDigestEmail).toBe(EnumNotificationSettingsValue.daily)
  })
})
