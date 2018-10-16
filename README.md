Allthings Node/Javascript SDK

[![Build status](https://badge.buildkite.com/0cba57805232b819e0bc2836dc96dd8314ab9165f9553623ca.svg?branch=master)](https://github.com/allthings/node-sdk)

## Contents

1.  [Installation & Usage](#installation--usage)
1.  [Configuration](#configuration)
    1.  [Options](#configuration-options)
2.  [Authentication](#authentication)
3.  [API](#api)
4.  [OAuth Implicit Grant Example](#oauth-implicit-grant-example-example)

## Installation & Usage

```sh
yarn add allthings
```

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restClient({
  accessToken: '043dab7447450772example1214b552838003522',
})

client.getCurrentUser().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```

<!--
```javascript
const allthingsSdk = require('@allthings/sdk')

const allthings = allthingsSdk({
  accessToken: '043dab7447450772example1214b552838003522',
})

allthings.query.viewer().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```
-->

## Configuration

### Configuration Options

The available configuration options are outlined here:

| Option           | Default | Description                                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| **accessToken**  |         | API Access Token                                                                                        |
| **clientId**     |         | OAuth 2.0 clientId                                                                                      |
| **clientSecret** |         | OAuth 2.0 client secret                                                                                 |
| **username**     |         | Username to use with OAuth 2.0 Password Grant authentication flow                                       |
| **password**     |         | Password to use with OAuth 2.0 Password Grant authentication flow                                       |
| **concurrency**  |         | Number of concurrent requests to perform in parallel. Default behavior is burst of 30/s, 1/s thereafter |
| **apiUrl**  |              | Base API url to use. Defaults to https://api.allthings.me/, respects value of the `ALLTHINGS_REST_API_URL` environment variable  |

## Authentication

@TODO

process.env.ALLTHINGS_OAUTH_CLIENT_ID
process.env.ALLTHINGS_OAUTH_CLIENT_SECRET,
process.env.ALLTHINGS_OAUTH_PASSWORD,
process.env.ALLTHINGS_OAUTH_USERNAME,

## OAuth Implicit Grant Example

@TODO

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restClient({
  accessToken: '043dab7447450772example1214b552838003522',
})

client.getCurrentUser().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```




## API

### Allthings SDK module

* [`restClient()`](#module-export-restClient)
  * [`client.agentCreate()`](#restclient-client-createagent)
  * [`client.agentCreatePermissions()`](#restclient-client-createagent)
  * [`client.appCreate()`](#restclient-client-createagent)
  * [`client.lookupIds()`](#restclient-client-createagent)
  * [`client.groupCreate()`](#restclient-client-createagent)
  * [`client.groupFindById()`](#restclient-client-createagent)
  * [`client.groupUpdateById()`](#restclient-client-createagent)
  * [`client.propertyCreate()`](#restclient-client-createagent)
  * [`client.propertyFindById()`](#restclient-client-createagent)
  * [`client.propertyUpdateById()`](#restclient-client-createagent)
  * [`client.registrationCodeCreate()`](#restclient-client-createagent)
  * [`client.unitCreate()`](#restclient-client-createagent)
  * [`client.unitFindById()`](#restclient-client-createagent)
  * [`client.unitUpdateById()`](#restclient-client-createagent)
  * [`client.userCreate()`](#restclient-client-createagent)
  * [`client.userFindById()`](#restclient-client-createagent)
  * [`client.userUpdateById()`](#restclient-client-createagent)
  * [`client.userCreatePermission()`](#restclient-client-createagent)
  * [`client.userFindPermissions()`](#restclient-client-createagent)
  * [`client.userDeletePermission()`](#restclient-client-createagent)
  * [`client.userGetUtilisationPeriods()`](#restclient-client-createagent)
  * [`client.userCheckInToUtilisationPeriod()`](#restclient-client-createagent)
  * [`client.getUsers()`](#restclient-client-createagent)
  * [`client.getCurrentUser()`](#restclient-client-createagent)
  * [`client.utilisationPeriodCreate()`](#restclient-client-createagent)
  * [`client.utilisationPeriodFindById()`](#restclient-client-createagent)
  * [`client.utilisationPeriodUpdateById()`](#restclient-client-createagent)
  * [`client.utilisationPeriodCheckInUser()`](#restclient-client-createagent)
  * [`client.delete()`](#restclient-client-delete)
  * [`client.get()`](#restclient-client-get)
  * [`client.post()`](#restclient-client-post)
  * [`client.patch()`](#restclient-client-patch)

---

<a name="module-export-restclient" />

### restClient(configurationOptions?): Client

Create an client instance of the SDK.

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restClient(configurationOptions)
```

---

<a name="restclient-client-createagent" />

### client.createAgent()

Create a new agent. This is a convenience function around creating a user and adding that user to a property-manager's team.

```javascript
const appId = '575027e58178f56a008b4568'
const propertyManagerId = '5a818c07ef5f2f00441146a2'
const username = 'mr.example@allthings.test'

const agent = await client.createAgent(
  appId,
  propertyManagerId,
  username,
  { email: 'mr.example@allthings.test', locale: 'en_US' }
)
```

```typescript
export type MethodCreateAgent = (
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
) => UserResult
```


```typescript
// Describes the API wrapper's resulting interface
export interface InterfaceAllthingsRestClient {
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
   * Get a group by its ID
   */
  readonly groupFindById: MethodGroupFindById

  /**
   * Update a group by its ID
   */
  readonly groupUpdateById: MethodGroupUpdateById

  // Property

  /**
   * Create a new property
   */
  readonly propertyCreate: MethodPropertyCreate

  /**
   * Get a property by its ID
   */
  readonly propertyFindById: MethodPropertyFindById

  /**
   * Update a property by its ID
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
   * Get a unit by its ID
   */
  readonly unitFindById: MethodUnitFindById

  /**
   * Update a unit by its ID
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
  readonly utilisationPeriodCreate: MethodUtilisationPeriodCreate

  /**
   * Get a utilisation period by its ID
   */
  readonly utilisationPeriodFindById: MethodUtilisationPeriodFindById

  /*
   * Update a utilisation period by its ID
   */
  readonly utilisationPeriodUpdateById: MethodUtilisationPeriodUpdateById

  /**
   * Check-in a user to a utilisation period with the users email
   */
  readonly utilisationPeriodCheckInUser: MethodUtilisationPeriodCheckInUser
}
```
