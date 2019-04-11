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
import { userRelationCreate, userRelationDelete } from './methods/userRelation'
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
  InterfaceAllthingsRestClient,
  InterfaceAllthingsRestClientOptions,
} from './types'

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

export { EnumUserPermissionRole, EnumUnitType, EnumUserPermissionObjectType }

/*
  The API wrapper
  Creates a new token via an OAuth Password Grant, then
  partially applies the api url, access token, get/post methods to
  api method function wrappers.
*/
export default function restClient(
  userOptions: Partial<
    InterfaceAllthingsRestClientOptions
  > = DEFAULT_API_WRAPPER_OPTIONS,
): InterfaceAllthingsRestClient {
  const options: InterfaceAllthingsRestClientOptions = {
    ...DEFAULT_API_WRAPPER_OPTIONS,
    ...userOptions,
  }

  if (typeof options.apiUrl === 'undefined') {
    throw new Error('API URL is undefined.')
  }

  if (typeof options.oauthUrl === 'undefined') {
    throw new Error('OAuth2 URL is undefined.')
  }

  if (!options.clientId && !options.accessToken) {
    throw new Error('Missing required "clientId" or "accessToken" parameter .')
  }

  const request = partial(httpRequest, options)

  // partially apply the request method to the get/post
  // http request method functions
  const del = partial(httpDelete, request)
  const get = partial(httpGet, request)
  const post = partial(httpPost, request)
  const patch = partial(httpPatch, request)

  const client: InterfaceAllthingsRestClient = API_METHODS.reduce(
    (methods, method) => ({
      ...methods,
      // tslint:disable-next-line readonly-array
      [method.name]: (...args: any[]) => method(client, ...args),
    }),
    { delete: del, get, options, patch, post },
  )

  return client
}
