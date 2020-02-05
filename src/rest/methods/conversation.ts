import { createManyFilesSorted } from '../../utils/upload'
import {
  EnumCommunicationMethodType,
  EnumInputChannel,
  IAllthingsRestClient,
} from '../types'

export interface IConversation {
  readonly id: string
  readonly createdAt: string
}

export interface IMessage {
  readonly content: {
    readonly content?: string
    readonly description?: string
    readonly files?: ReadonlyArray<string>
  }
  readonly createdAt: string
  readonly id: string
  readonly inputChannel?: EnumInputChannel
  readonly internal: boolean
  readonly read: boolean
  readonly type: string
  readonly _embedded?: any
  readonly _links?: any
}

export interface IMessagePayload {
  readonly attachments?: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>
  readonly body: string
  readonly createdBy: {
    readonly type: EnumCommunicationMethodType
    readonly value: string
  }
  readonly inputChannel?: string
}

export type ConversationResult = Promise<IConversation>

export type ConversationCreateMessageResult = Promise<IMessage>

/*
  Get a conversation by its ID
*/

export type MethodConversationGetById = (
  conversationId: string,
) => ConversationResult

export async function conversationGetById(
  client: IAllthingsRestClient,
  conversationId: string,
): ConversationResult {
  return client.get(`/v1/conversations/${conversationId}`)
}

/*
  Add a message to a conversation
*/

export type MethodConversationCreateMessage = (
  conversationId: string,
  messageData: IMessagePayload,
) => ConversationCreateMessageResult

export async function conversationCreateMessage(
  client: IAllthingsRestClient,
  conversationId: string,
  messageData: IMessagePayload,
): ConversationCreateMessageResult {
  const url = `/v1/conversations/${conversationId}/messages`

  const payload =
    messageData.attachments && messageData.attachments.length
      ? {
          content: {
            description: messageData.body,
            files: (
              await createManyFilesSorted(messageData.attachments, client)
            ).success,
          },
          createdBy: messageData.createdBy,
          inputChannel: messageData.inputChannel,
          internal: false,
          type: 'file',
        }
      : {
          content: {
            content: messageData.body,
          },
          createdBy: messageData.createdBy,
          inputChannel: messageData.inputChannel,
          type: 'text',
        }

  return client.post(url, payload)
}
