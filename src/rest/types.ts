import { TokenRequester } from '../oauth/types'
import { MethodHttpDelete } from './delete'
import { MethodHttpGet } from './get'
import {
  MethodAgentCreate,
  MethodAgentCreatePermissions,
} from './methods/agent'
import { MethodAppCreate } from './methods/app'
import {
  MethodBucketAddFile,
  MethodBucketCreate,
  MethodBucketGet,
  MethodBucketRemoveFile,
  MethodBucketRemoveFilesInPath,
} from './methods/bucket'
import { MethodFileCreate, MethodFileDelete } from './methods/file'
import {
  MethodGetGroups,
  MethodGroupCreate,
  MethodGroupGetById,
  MethodGroupUpdateById,
} from './methods/group'
import { MethodLookupIds } from './methods/idLookup'
import {
  MethodNotificationsGetByUser,
  MethodNotificationsUpdateReadByUser,
  MethodNotificationUpdateRead,
} from './methods/notification'
import {
  MethodGetProperties,
  MethodPropertyCreate,
  MethodPropertyGetById,
  MethodPropertyUpdateById,
} from './methods/property'
import {
  MethodRegistrationCodeCreate,
  MethodRegistrationCodeDelete,
  MethodRegistrationCodeGetById,
  MethodRegistrationCodeUpdateById,
} from './methods/registrationCode'
import {
  MethodGetUnits,
  MethodUnitCreate,
  MethodUnitGetById,
  MethodUnitUpdateById,
} from './methods/unit'
import {
  MethodGetCurrentUser,
  MethodGetUsers,
  MethodUserCheckInToUtilisationPeriod,
  MethodUserCreate,
  MethodUserCreatePermission,
  MethodUserCreatePermissionBatch,
  MethodUserDeletePermission,
  MethodUserGetById,
  MethodUserGetPermissions,
  MethodUserGetUtilisationPeriods,
  MethodUserUpdateById,
} from './methods/user'
import {
  MethodUserRelationCreate,
  MethodUserRelationDelete,
} from './methods/userRelation'
import {
  MethodUtilisationPeriodAddRegistrationCode,
  MethodUtilisationPeriodCheckInUser,
  MethodUtilisationPeriodCheckOutUser,
  MethodUtilisationPeriodCreate,
  MethodUtilisationPeriodGetById,
  MethodUtilisationPeriodUpdateById,
} from './methods/utilisationPeriod'
import { MethodHttpPatch } from './patch'
import { MethodHttpPost } from './post'

// Describes the possible resources which exist in the API
export enum EnumResource {
  property = 'property',
  group = 'group',
  registrationCode = 'registrationCode',
  unit = 'unit',
  utilisationPeriod = 'utilisationPeriod',
  user = 'user',
}

export enum EnumCountryCode {
  CH = 'CH',
  DE = 'DE',
  FR = 'FR',
  IT = 'IT',
  NL = 'NL',
  PT = 'PT',
  US = 'US',
}

export enum EnumLocale {
  ch_de = 'ch_DE',
  ch_fr = 'ch_FR',
  ch_it = 'ch_it',
  de_DE = 'de_DE',
  it_IT = 'it_IT',
  fr_FR = 'fr_FR',
  pt_PT = 'pt_PT',
  en_US = 'en_US',
}

export enum EnumTimezone {
  EuropeBerlin = 'Europe/Berlin',
  EuropeLondon = 'Europe/London',
  EuropeSofia = 'Europe/Sofia',
  EuropeZurich = 'Europe/Zurich',
  UTC = 'UTC',
}

export type EntityResultList<Entity, ExtensionInterface = {}> = Promise<
  {
    readonly _embedded: { readonly items: ReadonlyArray<Entity> }
    readonly total: number
  } & ExtensionInterface
>

// Describes the options with which to construct a new API wrapper instance
export interface IAllthingsRestClientOptions {
  readonly apiUrl: string
  readonly authorizationCode?: string
  readonly accessToken?: string
  readonly clientId?: string
  readonly clientSecret?: string
  readonly oauthUrl: string
  readonly password?: string
  readonly redirectUri?: string
  readonly refreshToken?: string | undefined
  readonly requestBackOffInterval: number
  readonly requestMaxRetries: number
  readonly scope?: string
  readonly state?: string
  readonly username?: string
  readonly implicit?: boolean
  // tslint:disable-next-line no-mixed-interface
  readonly authorizationRedirect?: (url: string) => any
}

export interface IClientExposedOAuth {
  readonly authorizationCode: {
    readonly getUri: (state?: string) => string
    readonly requestToken: (
      authorizationCode?: string,
    ) => ReturnType<TokenRequester>
  }
  // tslint:disable-next-line no-mixed-interface
  readonly refreshToken: (refreshToken?: string) => ReturnType<TokenRequester>
  readonly generateState: () => string
}

// Describes the REST API wrapper's resulting interface
export interface IAllthingsRestClient {
  readonly options: Required<IAllthingsRestClientOptions>

  readonly delete: MethodHttpDelete
  readonly get: MethodHttpGet
  readonly post: MethodHttpPost
  readonly patch: MethodHttpPatch

  readonly oauth: IClientExposedOAuth

  // Agent

  /**
   * Create a new agent. This is a convenience function around
   * creating a user and adding that user to a property-manager's team
   */
  readonly agentCreate: MethodAgentCreate

  /**
   * Create agent permissions. This is a convenience function around
   * creating two user permission's: one "admin" and the other "pinboard"
   */
  readonly agentCreatePermissions: MethodAgentCreatePermissions

  // App

  /**
   * Create a new App.
   */
  readonly appCreate: MethodAppCreate

  // Bucket

  /**
   * Create a new Bucket. Buckets are containers for files.
   */
  readonly bucketCreate: MethodBucketCreate
  /**
   * Adds a file to the bucket.
   */
  readonly bucketAddFile: MethodBucketAddFile
  /**
   * Deletes a file from a bucket.
   */
  readonly bucketRemoveFile: MethodBucketRemoveFile
  /**
   * Deletes all files within that bucket that are in the passed path.
   */
  readonly bucketRemoveFilesInPath: MethodBucketRemoveFilesInPath
  /**
   * Gets a Bucket.
   */
  readonly bucketGet: MethodBucketGet

  // ID Lookup

  /**
   * Map one or more externalId's to API ObjectId's within the scope of a specified App
   */
  readonly lookupIds: MethodLookupIds

  // Group

  /**
   * Create a new group within a property
   */
  readonly groupCreate: MethodGroupCreate

  /**
   * Get a group by its ID
   */
  readonly groupGetById: MethodGroupGetById

  /**
   * Update a group by its ID
   */
  readonly groupUpdateById: MethodGroupUpdateById

  /**
   * Get a list of units
   */
  readonly getUnits: MethodGetUnits

  // Notification

  /**
   * Returns a collection of notifications for a given user
   */
  readonly notificationsGetByUser: MethodNotificationsGetByUser

  /**
   * Marks all notifications of a user - until a provided timestamp (or now) - as read
   */
  readonly notificationsUpdateReadByUser: MethodNotificationsUpdateReadByUser

  /**
   * Mark a notification as read
   */
  readonly notificationUpdateRead: MethodNotificationUpdateRead

  // Property

  /**
   * Create a new property
   */
  readonly propertyCreate: MethodPropertyCreate

  /**
   * Get a property by its ID
   */
  readonly propertyGetById: MethodPropertyGetById

  /**
   * Update a property by its ID
   */
  readonly propertyUpdateById: MethodPropertyUpdateById

  /**
   * Get a list of properties
   */
  readonly getProperties: MethodGetProperties

  // Registration Code

  /**
   * Create a new registration code
   */
  readonly registrationCodeCreate: MethodRegistrationCodeCreate

  /**
   * Update a registration code
   */
  readonly registrationCodeUpdateById: MethodRegistrationCodeUpdateById

  /**
   * Find a registration code by it
   */
  readonly registrationCodeGetById: MethodRegistrationCodeGetById

  /**
   * Delete a registration code by it
   */
  readonly registrationCodeDelete: MethodRegistrationCodeDelete

  // File

  /**
   * Creates a file
   */
  readonly fileCreate: MethodFileCreate

  /**
   * Deletes a file by it's ID
   */
  readonly fileDelete: MethodFileDelete

  // Unit

  /**
   * Create a unit within a group
   */
  readonly unitCreate: MethodUnitCreate

  /**
   * Get a unit by its ID
   */
  readonly unitGetById: MethodUnitGetById

  /**
   * Update a unit by its ID
   */
  readonly unitUpdateById: MethodUnitUpdateById

  /**
   * Get a list of groups
   */
  readonly getGroups: MethodGetGroups

  // User

  /**
   * Create a new User.
   */
  readonly userCreate: MethodUserCreate

  /**
   * Get a user by their ID
   */
  readonly userGetById: MethodUserGetById

  /**
   * Update a user by their ID
   */
  readonly userUpdateById: MethodUserUpdateById

  /**
   * Get a list of users
   */
  readonly getUsers: MethodGetUsers

  /**
   * Get the current user from active session
   */
  readonly getCurrentUser: MethodGetCurrentUser

  /**
   * Give a user a permission/role on an given object of specified type
   */
  readonly userCreatePermission: MethodUserCreatePermission

  /**
   * Give a user multiple permission/role on an given object of specified type
   */
  readonly userCreatePermissionBatch: MethodUserCreatePermissionBatch

  /**
   * Get a list of user's permissions
   */
  readonly userGetPermissions: MethodUserGetPermissions

  /**
   * Delete a user a permission/role on an given object of specified type
   */
  readonly userDeletePermission: MethodUserDeletePermission

  /**
   * Get a list of user's current utilisation - periods
   */
  readonly userGetUtilisationPeriods: MethodUserGetUtilisationPeriods

  /**
   * Checkin a user into a Utilisation-Period with userId and
   * utilisation-periodId
   */
  readonly userCheckInToUtilisationPeriod: MethodUserCheckInToUtilisationPeriod

  // User Relation

  /**
   * Creates a new user relation
   */
  readonly userRelationCreate: MethodUserRelationCreate

  /**
   * Deletes a new user relation
   */
  readonly userRelationDelete: MethodUserRelationDelete

  // Utilisation Period

  /**
   * Create a new utilisation period within a Unit
   */
  readonly utilisationPeriodCreate: MethodUtilisationPeriodCreate

  /**
   * Get a utilisation period by its ID
   */
  readonly utilisationPeriodGetById: MethodUtilisationPeriodGetById

  /*
   * Update a utilisation period by its ID
   */
  readonly utilisationPeriodUpdateById: MethodUtilisationPeriodUpdateById

  /**
   * Check-in a user to a utilisation period with the users email
   */
  readonly utilisationPeriodCheckInUser: MethodUtilisationPeriodCheckInUser

  /**
   * Remove a user from a utilisation period with the utilisaitionPeriodId
   * and userId
   */
  readonly utilisationPeriodCheckOutUser: MethodUtilisationPeriodCheckOutUser

  /**
   * Add new registratation code by utilisation period
   */
  readonly utilisationPeriodAddRegistrationCode: MethodUtilisationPeriodAddRegistrationCode
}
