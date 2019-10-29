import { upload } from '../../utils/upload'
import { EntityResultList, IAllthingsRestClient } from '../types'

export interface IConversation {
  readonly id?: string
}

export interface IMessage {
  readonly content: { readonly content: string }
  readonly createdAt: string
  readonly id: string
  readonly internal: boolean
  readonly read: boolean
  readonly type: string
}

export interface IMessagePayload {
  readonly attachments?: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>
  readonly body: string
  readonly userId: string
}

export type ConversationResult = Promise<IConversation>
export type ConversationResultList = EntityResultList<IConversation>

export type ConversationCreateMessageResult = Promise<IMessage>

/*
  Get a conversation by its ID
*/

export async function conversationGetById(
  client: IAllthingsRestClient,
  unitId: string,
): ConversationResult {
  return client.get(`/v1/conversations/${unitId}`)
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
  const url = `/v1/conversations/${conversationId}/messages?forUser=${messageData.userId}`

  const payload =
    messageData.attachments && messageData.attachments.length
      ? {
          content: {
            description: messageData.body,
            files: await upload(messageData.attachments, client),
          },
          internal: false,
          type: 'file',
        }
      : {
          content: {
            content: messageData.body,
          },
          type: 'text',
        }

  return client.post(url, payload)
}
