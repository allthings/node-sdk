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
import { groupCreate, groupFindById, groupUpdateById } from './methods/group'
import { lookupIds } from './methods/idLookup'
import {
  notificationSettingsResetByUser,
  notificationSettingsUpdateByUser,
} from './methods/notificationSettings'
import {
  propertyCreate,
  propertyFindById,
  propertyUpdateById,
} from './methods/property'
import {
  registrationCodeCreate,
  registrationCodeDelete,
  registrationCodeFindById,
} from './methods/registrationCode'
import {
  EnumUnitType,
  unitCreate,
  unitFindById,
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
  userDeletePermission,
  userFindById,
  userFindPermissions,
  userGetUtilisationPeriods,
  userUpdateById,
} from './methods/user'
import {
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
  utilisationPeriodCreate,
  utilisationPeriodFindById,
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

  // Notification settings
  notificationSettingsResetByUser,
  notificationSettingsUpdateByUser,

  // Group
  groupCreate,
  groupFindById,
  groupUpdateById,

  // Property
  propertyCreate,
  propertyFindById,
  propertyUpdateById,

  // Registration Code
  registrationCodeCreate,
  registrationCodeDelete,
  registrationCodeFindById,

  // File
  fileCreate,
  fileDelete,

  // Unit
  unitCreate,
  unitFindById,
  unitUpdateById,

  // User
  userCreate,
  userFindById,
  userUpdateById,
  userCreatePermission,
  userFindPermissions,
  userDeletePermission,
  userCheckInToUtilisationPeriod,
  userGetUtilisationPeriods,
  getCurrentUser,
  getUsers,

  // Utilisation Periods
  utilisationPeriodCreate,
  utilisationPeriodFindById,
  utilisationPeriodUpdateById,
  utilisationPeriodCheckInUser,
  utilisationPeriodCheckOutUser,
]

export { EnumUnitType, EnumUserPermissionObjectType, EnumUserPermissionRole }

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
