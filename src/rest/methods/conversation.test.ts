// tslint:disable:no-expression-statement

import { readFileSync } from 'fs'
import restClient from '..'
import { COMMUNICATION_METHOD, CONVERSATION_ID } from '../../../test/constants'

const client = restClient()

describe('conversationGetById()', () => {
  it('should be able to get a conversation by ID', async () => {
    const result = await client.conversationGetById(CONVERSATION_ID)

    expect(result.id).toEqual(CONVERSATION_ID)
  })
})

describe('conversationCreateMessage()', () => {
  it('should be able to add a message to a conversation', async () => {
    const content = 'some message'
    const result = await client.conversationCreateMessage(CONVERSATION_ID, {
      body: content,
      createdBy: {
        type: COMMUNICATION_METHOD.type,
        value: COMMUNICATION_METHOD.value,
      },
    })

    expect(result.content.content).toEqual(content)
    expect(result._embedded.createdByCommunicationMethod).toMatchObject(
      COMMUNICATION_METHOD,
    )
  })

  it('should be able to add a message to a conversation with attachments', async () => {
    const content = 'some message'
    const result = await client.conversationCreateMessage(CONVERSATION_ID, {
      attachments: [
        {
          content: readFileSync(__dirname + '/../../../test/fixtures/1x1.png'),
          filename: '2x2.png',
        },
      ],
      body: content,
      createdBy: {
        type: COMMUNICATION_METHOD.type,
        value: COMMUNICATION_METHOD.value,
      },
    })

    expect(result.content.description).toEqual(content)
    expect(result._embedded.createdByCommunicationMethod).toMatchObject(
      COMMUNICATION_METHOD,
    )

    if (result.content.files) {
      expect(result.content.files.length).toEqual(1)
    }
  })
})
