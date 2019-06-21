import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { partial } from '../utils/functional'
import httpDelete from './delete'
import httpGet from './get'
import { agentCreate, agentCreatePermissions } from './methods/agent'
import { appCreate } from './methods/app'
import {
  bucketAddFile,
  bucketCreate,
  bucketGet,
  bucketRemoveFile,
  bucketRemoveFilesInPath,
} from './methods/bucket'
import { fileCreate, fileDelete } from './methods/file'
import { groupCreate, groupGetById, groupUpdateById } from './methods/group'
import { lookupIds } from './methods/idLookup'
import {
  notificationsGetByUser,
  notificationsUpdateReadByUser,
  notificationUpdateRead,
} from './methods/notification'
import {
  propertyCreate,
  propertyGetById,
  propertyUpdateById,
} from './methods/property'
import {
  registrationCodeCreate,
  registrationCodeDelete,
  registrationCodeGetById,
  registrationCodeUpdateById,
} from './methods/registrationCode'
import {
  EnumUnitType,
  unitCreate,
  unitGetById,
  unitUpdateById,
} from './methods/unit'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  getCurrentUser,
  getUsers,
  userCheckInToUtilisationPeriod,
  userCreate,
  userCreatePermission,
  userCreatePermissionBatch,
  userDeletePermission,
  userGetById,
  userGetPermissions,
  userGetUtilisationPeriods,
  userUpdateById,
} from './methods/user'
import {
  EnumUserRelationType,
  userRelationCreate,
  userRelationDelete,
} from './methods/userRelation'
import {
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
  utilisationPeriodCreate,
  utilisationPeriodGetById,
  utilisationPeriodUpdateById,
} from './methods/utilisationPeriod'
import httpPatch from './patch'
import httpPost from './post'
import httpRequest from './request'
import {
  IAllthingsRestClient,
  IAllthingsRestClientOptions,
  IClientExposedOAuth,
} from './types'

import {
  getRedirectUrl as getAuthorizationUrl,
  requestToken as requestTokenByCode,
} from '../oauth/authorizationCodeGrant'
import makeFetchTokenRequester from '../oauth/makeFetchTokenRequester'
import makeTokenStore from '../oauth/makeTokenStore'
import { requestToken as performRefreshTokenGrant } from '../oauth/refreshTokenGrant'
import requestAndSaveToStore from '../oauth/requestAndSaveToStore'

const API_METHODS: ReadonlyArray<any> = [
  // Agent
  agentCreate,
  agentCreatePermissions,

  // App
  appCreate,

  // Bucket
  bucketCreate,
  bucketAddFile,
  bucketRemoveFile,
  bucketRemoveFilesInPath,
  bucketGet,

  // ID Lookup
  lookupIds,

  // Notification
  notificationsGetByUser,
  notificationUpdateRead,
  notificationsUpdateReadByUser,

  // Group
  groupCreate,
  groupGetById,
  groupUpdateById,

  // Property
  propertyCreate,
  propertyGetById,
  propertyUpdateById,

  // Registration Code
  registrationCodeCreate,
  registrationCodeUpdateById,
  registrationCodeDelete,
  registrationCodeGetById,

  // File
  fileCreate,
  fileDelete,

  // Unit
  unitCreate,
  unitGetById,
  unitUpdateById,

  // User
  userCreate,
  userGetById,
  userUpdateById,
  userCreatePermission,
  userCreatePermissionBatch,
  userGetPermissions,
  userDeletePermission,
  userCheckInToUtilisationPeriod,
  userGetUtilisationPeriods,
  getCurrentUser,
  getUsers,

  // User Relations
  userRelationCreate,
  userRelationDelete,

  // Utilisation Periods
  utilisationPeriodCreate,
  utilisationPeriodGetById,
  utilisationPeriodUpdateById,
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
]

export {
  EnumUserPermissionRole,
  EnumUnitType,
  EnumUserPermissionObjectType,
  EnumUserRelationType,
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
    !options.accessToken &&
    typeof window === 'undefined'
  ) {
    throw new Error('Missing required "clientId" or "accessToken" parameter .')
  }

  const tokenRequester = makeFetchTokenRequester(
    `${options.oauthUrl}/oauth/token`,
  )
  const tokenStore = makeTokenStore({
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

  const oauth: IClientExposedOAuth = {
    authorizationCode: {
      getUri: (state?: string) =>
        partial(getAuthorizationUrl, {
          ...options,
          state: state || options.state,
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
    refreshToken: () =>
      requestAndSaveToStore(
        partial(performRefreshTokenGrant, tokenRequester, {
          ...options,
          refreshToken: tokenStore.get('refreshToken'),
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
    },
  )

  return client
}
