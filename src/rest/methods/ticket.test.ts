// tslint:disable:no-expression-statement
import { readFileSync } from 'fs'
import {
  APP_CHANNEL,
  CATEGORY_ID,
  COMMUNICATION_METHOD,
  SERVICE_PROVIDER_ID,
  USER_ID,
  UTILISATION_PERIOD_ID,
} from '../../../test/constants'
import restClient from '../index'

const client = restClient()

afterEach(jest.clearAllMocks)

describe('ticketGetById()', () => {
  it('should be able to get a ticket by ID', async () => {
    const { id } = await client.ticketCreateOnUser(
      USER_ID,
      UTILISATION_PERIOD_ID,
      {
        category: CATEGORY_ID,
        description: 'description',
        inputChannel: 'test',
        title: 'title',
      },
    )
    const result = await client.ticketGetById(id)

    expect(result.id).toEqual(id)
    expect(result.description).toEqual('description')
    expect(result.title).toEqual('title')
  })
})

describe('ticketCreateOnUser()', () => {
  it('should be able to create a ticket on a user', async () => {
    const result = await client.ticketCreateOnUser(
      USER_ID,
      UTILISATION_PERIOD_ID,
      {
        category: CATEGORY_ID,
        description: 'description',
        files: [
          {
            content: readFileSync(
              __dirname + '/../../../test/fixtures/1x1.png',
            ),
            filename: '2x2.png',
          },
        ],
        inputChannel: 'test',
        title: 'title',
      },
    )

    expect(result.description).toEqual('description')
    expect(result.title).toEqual('title')
    expect(result.files.length).toEqual(1)
  })
})

describe('ticketCreateOnServiceProvider()', () => {
  it('should be able to create a ticket on a service provider', async () => {
    const customSettingsItemName = {
      key: 'requesterName',
      type: 'string',
      value: 'John Doe',
    }
    const customSettingsItemEmail = {
      key: 'requesterEmail',
      type: 'string',
      value: 'john@doe.com',
    }
    const result = await client.ticketCreateOnServiceProvider(
      SERVICE_PROVIDER_ID,
      {
        category: CATEGORY_ID,
        channel: 'app',
        createdByCommunicationMethod: {
          type: COMMUNICATION_METHOD.type,
          value: COMMUNICATION_METHOD.value,
        },
        customSettings: [customSettingsItemName, customSettingsItemEmail],
        description: 'description',
        inputChannel: 'test',
        phoneNumber: '+49 12 34 56',
        title: 'title',
      },
    )

    expect(result.description).toEqual('description')
    expect(result.title).toEqual('title')
    expect(result.phoneNumber).toEqual('+49 12 34 56')
    expect(result.customSettings).toEqual({
      [customSettingsItemEmail.key]: customSettingsItemEmail.value,
      [customSettingsItemName.key]: customSettingsItemName.value,
    })
    expect(result.files.length).toEqual(0)
  })

  it('should be able to create a ticket on a service provider with files', async () => {
    const result = await client.ticketCreateOnServiceProvider(
      SERVICE_PROVIDER_ID,
      {
        category: CATEGORY_ID,
        channel: APP_CHANNEL,
        createdByCommunicationMethod: {
          type: COMMUNICATION_METHOD.type,
          value: COMMUNICATION_METHOD.value,
        },
        description: 'description',
        files: [
          {
            content: readFileSync(
              __dirname + '/../../../test/fixtures/1x1.png',
            ),
            filename: '2x2.png',
          },
        ],
        inputChannel: 'test',
        title: 'title',
      },
    )

    expect(result.description).toEqual('description')
    expect(result.title).toEqual('title')
    expect(result.files.length).toEqual(1)
  })
})
