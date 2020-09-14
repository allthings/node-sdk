import { nanoid as generateId } from 'nanoid'
import restClient, { EnumUnitType } from '../src/rest'
import { IUser } from '../src/rest/methods/user'
import { IUtilisationPeriod } from '../src/rest/methods/utilisationPeriod'
import {
  EnumLocale,
  EnumTimezone,
  IAllthingsRestClient,
} from '../src/rest/types'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from './constants'

export type CreateUserAndClientResult = Promise<{
  readonly client: IAllthingsRestClient
  readonly user: IUser
}>

export async function createUserAndClient(): CreateUserAndClientResult {
  const defaultClient = restClient()

  const email = generateId() + '@foobar.test'
  const password = generateId()

  const data = {
    company: APP_PROPERTY_MANAGER_ID,
    description: 'Foobar User',
    email,
    externalId: generateId(),
    locale: EnumLocale.en_US,
    plainPassword: password,
  }

  return {
    client: restClient({
      password,
      username: email,
    }),

    user: await defaultClient.userCreate(APP_ID, generateId(), data),
  }
}

export async function createUtilisationPeriod(): Promise<IUtilisationPeriod> {
  const defaultClient = restClient()

  const property = await defaultClient.propertyCreate(APP_ID, {
    name: 'CommunityArticleStatsGetByUser Test Property',
    timezone: EnumTimezone.EuropeBerlin,
  })

  const group = await defaultClient.groupCreate(property.id, {
    name: 'CommunityArticleStatsGetByUser Test Group',
    propertyManagerId: APP_PROPERTY_MANAGER_ID,
  })

  const unit = await defaultClient.unitCreate(group.id, {
    name: 'CommunityArticleStatsGetByUser Test Unit',
    type: EnumUnitType.rented,
  })

  return defaultClient.utilisationPeriodCreate(unit.id, {
    endDate: '2050-01-03',
    externalId: generateId(),
    startDate: '2015-01-03',
  })
}

export async function createUserWithUtilizationPeriod(): CreateUserAndClientResult {
  const defaultClient = restClient()

  const [utilisationPeriod, { client, user }] = await Promise.all([
    await createUtilisationPeriod(),
    await createUserAndClient(),
  ])

  // tslint:disable-next-line no-expression-statement
  await defaultClient.userCheckInToUtilisationPeriod(
    user.id,
    utilisationPeriod.id,
  )

  return {
    client,
    user,
  }
}
