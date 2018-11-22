// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID } from '../../../test/constants'
import { createUserWithUtilizationPeriod } from '../../../test/helpers'
import { EnumNotificationCategory, EnumNotificationType } from './notification'
import { IUser } from './user'

const client = restClient()

async function createAdminMessage(author: IUser, title: string): Promise<void> {
  await client.post(`/v1/users/${author.id}/community-articles`, {
    category: 'admin-messages',
    channels: [`App-${APP_ID}`],
    content: title,
    title,
  })
}

describe('notificationsGetByUser()', () => {
  it('should be able to get a list of notifications', async () => {
    const [
      currentUser,
      { client: regularClient, user: regularUser },
    ] = await Promise.all([
      await client.getCurrentUser(),
      await createUserWithUtilizationPeriod(),
    ])

    const title = 'test title'

    await createAdminMessage(currentUser, title)

    const result = await regularClient.notificationsGetByUser(regularUser.id)

    expect(result._embedded.items).toHaveLength(1)
    expect(result._embedded.items[0]).toEqual(
      expect.objectContaining({
        category: EnumNotificationCategory.adminMessages,
        title: expect.stringContaining(title),
        type: EnumNotificationType.communityArticle,
      }),
    )
  })
})

describe('notificationsUpdateReadByUser()', () => {
  it('should be able to mark all notifications - older than now - read', async () => {
    const [
      currentUser,
      { client: regularClient, user: regularUser },
    ] = await Promise.all([
      await client.getCurrentUser(),
      await createUserWithUtilizationPeriod(),
    ])

    await createAdminMessage(currentUser, 'title')

    expect(
      (await regularClient.notificationsGetByUser(regularUser.id))._embedded
        .items[0].read,
    ).toBe(false)

    await regularClient.notificationsUpdateReadByUser(regularUser.id)

    expect(
      (await regularClient.notificationsGetByUser(regularUser.id))._embedded
        .items[0].read,
    ).toBe(true)
  })
})

describe('notificationUpdateRead()', () => {
  it('should be able to a notifications as read', async () => {
    const [
      currentUser,
      { client: regularClient, user: regularUser },
    ] = await Promise.all([
      await client.getCurrentUser(),
      await createUserWithUtilizationPeriod(),
    ])

    await createAdminMessage(currentUser, 'title')

    const notification = (await regularClient.notificationsGetByUser(
      regularUser.id,
    ))._embedded.items[0]

    expect(notification.read).toBe(false)

    const updatedNotification = await regularClient.notificationUpdateRead(
      notification.id,
    )

    expect(updatedNotification.read).toBe(true)
  })
})
