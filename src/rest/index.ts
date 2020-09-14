import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import {
  getRedirectUrl as getAuthorizationUrl,
  requestToken as requestTokenByCode,
} from '../oauth/authorizationCodeGrant'
import createTokenStore from '../oauth/createTokenStore'
import makeFetchTokenRequester from '../oauth/makeFetchTokenRequester'
import { requestToken as performRefreshTokenGrant } from '../oauth/refreshTokenGrant'
import requestAndSaveToStore from '../oauth/requestAndSaveToStore'
import { partial } from '../utils/functional'
import { pseudoRandomString } from '../utils/random'
import httpDelete from './delete'
import httpGet from './get'
import { agentCreate, agentCreatePermissions } from './methods/agent'
import { appCreate, appGetById } from './methods/app'
import {
  bucketAddFile,
  bucketCreate,
  bucketGet,
  bucketRemoveFile,
  bucketRemoveFilesInPath,
} from './methods/bucket'
import {
  conversationCreateMessage,
  conversationGetById,
} from './methods/conversation'
import { fileCreate, fileDelete } from './methods/file'
import {
  getGroups,
  groupCreate,
  groupGetById,
  groupUpdateById,
} from './methods/group'
import { lookupIds } from './methods/idLookup'
import {
  notificationsGetByUser,
  notificationsUpdateReadByUser,
  notificationUpdateRead,
} from './methods/notification'
import {
  notificationSettingsResetByUser,
  notificationSettingsUpdateByUser,
} from './methods/notificationSettings'
import {
  getProperties,
  propertyCreate,
  propertyGetById,
  propertyUpdateById,
} from './methods/property'
import {
  getRegistrationCodes,
  registrationCodeCreate,
  registrationCodeDelete,
  registrationCodeGetById,
  registrationCodeUpdateById,
} from './methods/registrationCode'
import {
  serviceProviderCreate,
  serviceProviderGetById,
  serviceProviderUpdateById,
} from './methods/serviceProvider'
import {
  ticketCreateOnServiceProvider,
  ticketCreateOnUser,
  ticketGetById,
} from './methods/ticket'
import {
  EnumUnitObjectType,
  EnumUnitType,
  getUnits,
  unitCreate,
  unitGetById,
  unitUpdateById,
} from './methods/unit'
import {
  EnumCommunicationPreferenceChannel,
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
  getCurrentUser,
  getUsers,
  userChangePassword,
  userCheckInToUtilisationPeriod,
  userCreate,
  userCreatePermission,
  userCreatePermissionBatch,
  userDeletePermission,
  userGetByEmail,
  userGetById,
  userGetPermissions,
  userGetUtilisationPeriods,
  userUpdateById,
} from './methods/user'
import {
  EnumUserRelationType,
  userRelationCreate,
  userRelationDelete,
  userRelationsGetByUser,
} from './methods/userRelation'
import {
  EnumUtilisationPeriodType,
  utilisationPeriodAddRegistrationCode,
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
  utilisationPeriodCreate,
  utilisationPeriodDelete,
  utilisationPeriodGetById,
  utilisationPeriodUpdateById,
} from './methods/utilisationPeriod'
import httpPatch from './patch'
import httpPost from './post'
import httpPut from './put'
import httpRequest from './request'
import {
  IAllthingsRestClient,
  IAllthingsRestClientOptions,
  IClientExposedOAuth,
} from './types'

const API_METHODS: ReadonlyArray<any> = [
  // Agent
  agentCreate,
  agentCreatePermissions,

  // App
  appCreate,
  appGetById,

  // Bucket
  bucketCreate,
  bucketAddFile,
  bucketRemoveFile,
  bucketRemoveFilesInPath,
  bucketGet,

  // Conversation
  conversationGetById,
  conversationCreateMessage,

  // File
  fileCreate,
  fileDelete,

  // Notification settings
  notificationSettingsResetByUser,
  notificationSettingsUpdateByUser,

  // Group
  groupCreate,
  groupGetById,
  groupUpdateById,
  getGroups,

  // ID Lookup
  lookupIds,

  // Notification
  notificationsGetByUser,
  notificationUpdateRead,
  notificationsUpdateReadByUser,

  // Property
  propertyCreate,
  propertyGetById,
  propertyUpdateById,
  getProperties,

  // Service Provider
  serviceProviderCreate,
  serviceProviderGetById,
  serviceProviderUpdateById,

  // Registration Code
  getRegistrationCodes,
  registrationCodeCreate,
  registrationCodeUpdateById,
  registrationCodeDelete,
  registrationCodeGetById,

  // Ticket
  ticketCreateOnUser,
  ticketCreateOnServiceProvider,
  ticketGetById,

  // Unit
  unitCreate,
  unitGetById,
  unitUpdateById,
  getUnits,

  // User
  userCreate,
  userGetById,
  userUpdateById,
  userChangePassword,
  userCreatePermission,
  userCreatePermissionBatch,
  userGetPermissions,
  userDeletePermission,
  userCheckInToUtilisationPeriod,
  userGetUtilisationPeriods,
  userGetByEmail,
  getCurrentUser,
  getUsers,

  // User Relations
  userRelationCreate,
  userRelationDelete,
  userRelationsGetByUser,

  // Utilisation Periods
  utilisationPeriodCreate,
  utilisationPeriodDelete,
  utilisationPeriodGetById,
  utilisationPeriodUpdateById,
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
  utilisationPeriodAddRegistrationCode,
]

export {
  EnumCommunicationPreferenceChannel,
  EnumUserPermissionRole,
  EnumUnitObjectType,
  EnumUnitType,
  EnumUserPermissionObjectType,
  EnumUserRelationType,
  EnumUserType,
  EnumUtilisationPeriodType,
}

/*
  The API wrapper
  Creates a new token via an OAuth Password Grant, then
  partially applies the api url, access token, get/post methods to
  api method function wrappers.
*/
export default function restClient(
  userOptions: Partial<
    IAllthingsRestClientOptions
  > = DEFAULT_API_WRAPPER_OPTIONS,
): IAllthingsRestClient {
  const options: IAllthingsRestClientOptions = {
    ...DEFAULT_API_WRAPPER_OPTIONS,
    ...userOptions,
  }

  if (typeof options.apiUrl === 'undefined') {
    throw new Error('API URL is undefined.')
  }

  if (typeof options.oauthUrl === 'undefined') {
    throw new Error('OAuth2 URL is undefined.')
  }

  // in browser access token can be obtained from URL during implicit flow
  if (
    !options.clientId &&
    !(options.accessToken || options.tokenStore) &&
    typeof window === 'undefined'
  ) {
    throw new Error('Missing required "clientId" or "accessToken" parameter .')
  }

  const tokenRequester = makeFetchTokenRequester(
    `${options.oauthUrl}/oauth/token`,
  )
  const tokenStore =
    options.tokenStore ||
    createTokenStore({
      accessToken: options.accessToken,
      refreshToken: options.refreshToken,
    })

  const request = partial(httpRequest, tokenStore, tokenRequester, options)

  // partially apply the request method to the get/post
  // http request method functions
  const del = partial(httpDelete, request)
  const get = partial(httpGet, request)
  const post = partial(httpPost, request)
  const patch = partial(httpPatch, request)
  const put = partial(httpPut, request)

  const oauth: IClientExposedOAuth = {
    authorizationCode: {
      getUri: (state = options.state || pseudoRandomString()) =>
        partial(getAuthorizationUrl, {
          ...options,
          state,
        })(),
      requestToken: (authorizationCode?: string) =>
        requestAndSaveToStore(
          partial(requestTokenByCode, tokenRequester, {
            ...options,
            authorizationCode: authorizationCode || options.authorizationCode,
          }),
          tokenStore,
        ),
    },
    generateState: pseudoRandomString,
    refreshToken: (refreshToken?: string) =>
      requestAndSaveToStore(
        partial(performRefreshTokenGrant, tokenRequester, {
          ...options,
          refreshToken: refreshToken || tokenStore.get('refreshToken'),
        }),
        tokenStore,
      ),
  }

  const client: IAllthingsRestClient = API_METHODS.reduce(
    (methods, method) => ({
      ...methods,
      // tslint:disable-next-line readonly-array
      [method.name]: (...args: any[]) => method(client, ...args),
    }),
    {
      delete: del,
      get,
      oauth,
      options,
      patch,
      post,
      put,
    },
  )

  return client
}
