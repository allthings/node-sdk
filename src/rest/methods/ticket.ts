import { createManyFilesSorted } from '../../utils/upload'
import { IAllthingsRestClient } from '../types'
import { IMessage } from './conversation'
import { IFile } from './file'
import { IUser } from './user'

export enum ETicketStatus {
  CLOSED = 'closed',
  WAITING_FOR_AGENT = 'waiting-for-agent',
  WAITING_FOR_CUSTOMER = 'waiting-for-customer',
  WAITING_FOR_EXTERNAL = 'waiting-for-external',
}

export enum ETrafficLightColor {
  GREEN = 'green',
  RED = 'red',
  YELLOW = 'yellow',
}

export interface ITicketLabel {
  readonly id: string
  readonly key: string
  readonly name: IMessage
}

export interface ITicketCreatePayload {
  readonly files?: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>
  readonly category: string
  readonly channel?: string
  readonly createdByCommunicationMethod?: {
    readonly type: string
    readonly value: string
  }
  readonly description: string
  readonly inputChannel: string
  readonly title: string
}

interface ITicketParticipant extends IUser {
  readonly roles: ReadonlyArray<string>
}

export interface ITicket {
  readonly _embedded: {
    readonly assignedTo: IUser
    readonly category: { readonly id: string; readonly name: IMessage }
    readonly conversations: ReadonlyArray<{
      readonly id: string
      readonly _embedded: {
        readonly participants: ReadonlyArray<ITicketParticipant>
      }
    }>
    readonly createdBy: IUser
    readonly files: ReadonlyArray<IFile>
    readonly group: { readonly address: object }
    readonly labels: ReadonlyArray<ITicketLabel>
    readonly property: {
      readonly id: string
      readonly name: string
    }
    readonly unit: { readonly name: string }
  }
  readonly category: string
  readonly channels: ReadonlyArray<string>
  readonly commentCount: number
  readonly createdAt: string
  readonly customerWaitingSinceIndicator: ETrafficLightColor
  readonly description: string
  readonly files: ReadonlyArray<string>
  readonly id: string
  readonly incrementID: string
  readonly labels: ReadonlyArray<string>
  readonly lastStatusUpdate: string
  readonly phoneNumber: string
  readonly read: boolean
  readonly sortHash: string
  readonly status: ETicketStatus
  readonly tags: ReadonlyArray<string>
  readonly title: string
  readonly unreadAdminMessages: number
  readonly unreadUserMessages: number
  readonly updatedAt: string
}

export type TicketResult = Promise<ITicket>

/*
  Get a ticket by its ID
*/

export type MethodTicketGetById = (ticketId: string) => TicketResult

export async function ticketGetById(
  client: IAllthingsRestClient,
  ticketId: string,
): TicketResult {
  return client.get(`/v1/tickets/${ticketId}`)
}

/*
  Create a ticket on a user
 */

export type MethodTicketCreateOnUser = (
  userId: string,
  utilisationPeriodId: string,
  payload: ITicketCreatePayload,
) => TicketResult

export async function ticketCreateOnUser(
  client: IAllthingsRestClient,
  userId: string,
  utilisationPeriodId: string,
  payload: ITicketCreatePayload,
): TicketResult {
  return client.post(`/v1/users/${userId}/tickets`, {
    ...payload,
    files: payload.files
      ? (await createManyFilesSorted(payload.files, client)).success
      : [],
    utilisationPeriod: utilisationPeriodId,
  })
}

/*
  Create a ticket on a service provider

  Allows for a ticket to be created on a service provider where a user might not
  exist (Anonymous tickets)
 */

export type MethodTicketCreateOnServiceProvider = (
  serviceProviderId: string,
  payload: ITicketCreatePayload,
) => TicketResult

export async function ticketCreateOnServiceProvider(
  client: IAllthingsRestClient,
  serviceProviderId: string,
  payload: ITicketCreatePayload,
): TicketResult {
  return client.post(`/v1/property-managers/${serviceProviderId}/tickets`, {
    ...payload,
    files: payload.files
      ? (await createManyFilesSorted(payload.files, client)).success
      : [],
  })
}
