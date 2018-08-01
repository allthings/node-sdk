import { MethodHttpDelete } from './delete'
import { MethodHttpGet } from './get'
import {
  MethodAgentCreate,
  MethodAgentCreatePermissions,
} from './methods/agent'
import { MethodAppCreate } from './methods/app'
import {
  MethodGroupCreate,
  MethodGroupFindById,
  MethodGroupUpdateById,
} from './methods/group'
import { MethodLookupIds } from './methods/idLookup'
import {
  MethodPropertyCreate,
  MethodPropertyFindById,
  MethodPropertyUpdateById,
} from './methods/property'
import { MethodRegistrationCodeCreate } from './methods/registrationCode'
import {
  MethodUnitCreate,
  MethodUnitFindById,
  MethodUnitUpdateById,
} from './methods/unit'
import {
  MethodGetCurrentUser,
  MethodGetUsers,
  MethodUserCheckInToUtilisationPeriod,
  MethodUserCreate,
  MethodUserCreatePermission,
  MethodUserDeletePermission,
  MethodUserFindById,
  MethodUserFindPermissions,
  MethodUserGetUtilisationPeriods,
  MethodUserUpdateById,
} from './methods/user'
import {
  MethodUtilisationPeriodCheckInUser,
  MethodUtilisationPeriodCreated,
  MethodUtilisationPeriodFindById,
  MethodUtilisationPeriodUpdateById,
} from './methods/utilisationPeriod'
import { MethodHttpPatch } from './patch'
import { MethodHttpPost } from './post'

// Describes the possible resources which exist in the API
export enum EnumResource {
  property = 'property',
  group = 'group',
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

// Describes the options with which to construct a new API wrapper instance
export interface InterfaceAllthingsRestClientOptions {
  readonly apiUrl: string
  readonly accessToken?: string
  readonly clientId?: string
  readonly clientSecret?: string
  readonly oauthUrl: string
  readonly password?: string
  readonly requestBackOffInterval: number
  readonly requestMaxRetries: number
  readonly username?: string
}

// Describes the REST API wrapper's resulting interface
export interface InterfaceAllthingsRestClient {
  readonly options: Required<InterfaceAllthingsRestClientOptions>

  readonly delete: MethodHttpDelete
  readonly get: MethodHttpGet
  readonly post: MethodHttpPost
  readonly patch: MethodHttpPatch

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
   * Get a group by it's ID
   */
  readonly groupFindById: MethodGroupFindById

  /**
   * Update a group by it's ID
   */
  readonly groupUpdateById: MethodGroupUpdateById

  // Property

  /**
   * Create a new property
   */
  readonly propertyCreate: MethodPropertyCreate

  /**
   * Get a property by it's ID
   */
  readonly propertyFindById: MethodPropertyFindById

  /**
   * Update a property by it's ID
   */
  readonly propertyUpdateById: MethodPropertyUpdateById

  // Registration Code

  /**
   * Create a new registration code
   */
  readonly registrationCodeCreate: MethodRegistrationCodeCreate

  // Unit

  /**
   * Create a unit within a group
   */
  readonly unitCreate: MethodUnitCreate

  /**
   * Get a unit by it's ID
   */
  readonly unitFindById: MethodUnitFindById

  /**
   * Update a unit by it's ID
   */
  readonly unitUpdateById: MethodUnitUpdateById

  // User

  /**
   * Create a new User.
   */
  readonly userCreate: MethodUserCreate

  /**
   * Get a user by their ID
   */
  readonly userFindById: MethodUserFindById

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
   * Get a list of user's permissions
   */
  readonly userFindPermissions: MethodUserFindPermissions

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

  // Utilisation Period

  /**
   * Create a new utilisation period within a Unit
   */
  readonly utilisationPeriodCreate: MethodUtilisationPeriodCreated

  /**
   * Get a utilisation period by it's ID
   */
  readonly utilisationPeriodFindById: MethodUtilisationPeriodFindById

  /*
   * Update a utilisation period by it's ID
   */
  readonly utilisationPeriodUpdateById: MethodUtilisationPeriodUpdateById

  /**
   * Check-in a user to a utilisation period with the users email
   */
  readonly utilisationPeriodCheckInUser: MethodUtilisationPeriodCheckInUser
}
