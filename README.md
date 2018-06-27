Allthings Node/Javascript SDK

[![Build status](https://badge.buildkite.com/0cba57805232b819e0bc2836dc96dd8314ab9165f9553623ca.svg?branch=master)](https://github.com/allthings/node-sdk)

## Contents

1.  [Installation & Usage](#installation--usage)
1.  [Configuration](#configuration)
    1.  [Options](#configuration-options)
2.  [API](#api)
3.  [OAuth Implicit Grant Example](#oauth-implicit-grant-example-example)

## Installation & Usage

```sh
yarn add @allthings/sdk
```

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restSdk({
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



## OAuth Implicit Grant Example

@TODO

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restSdk({
  accessToken: '043dab7447450772example1214b552838003522',
})

client.getCurrentUser().then(viewer => 
  console.log(`Welcome back ${viewer.username}!`)
)
```




## API

### Allthings SDK module

* [`restSdk()`](#module-export-restSdk)
  * [`client.createAgent()`](#restsdk-client-createagent)
  * [`client.createAgentPermissions()`](#restsdk-client-createagent)
  * [`client.createApp()`](#restsdk-client-createagent)
  * [`client.createIdLookup()`](#restsdk-client-createagent)
  * [`client.createGroup()`](#restsdk-client-createagent)
  * [`client.getGroupById()`](#restsdk-client-createagent)
  * [`client.updateGroupById()`](#restsdk-client-createagent)
  * [`client.createProperty()`](#restsdk-client-createagent)
  * [`client.getPropertyById()`](#restsdk-client-createagent)
  * [`client.updatePropertyById()`](#restsdk-client-createagent)
  * [`client.createRegistrationCode()`](#restsdk-client-createagent)
  * [`client.createUnit()`](#restsdk-client-createagent)
  * [`client.getUnitById()`](#restsdk-client-createagent)
  * [`client.createUser()`](#restsdk-client-createagent)
  * [`client.createUserPermission()`](#restsdk-client-createagent)
  * [`client.deleteUserPermission()`](#restsdk-client-createagent)
  * [`client.getUsers()`](#restsdk-client-createagent)
  * [`client.getCurrentUser()`](#restsdk-client-createagent)
  * [`client.getUserById()`](#restsdk-client-createagent)
  * [`client.getUserPermissions()`](#restsdk-client-createagent)
  * [`client.updateUserById()`](#restsdk-client-createagent)
  * [`client.createUtilisationPeriod()`](#restsdk-client-createagent)
  * [`client.getUtilisationPeriodById()`](#restsdk-client-createagent)
  * [`client.updateUtilisationPeriodById()`](#restsdk-client-createagent)
  * [`client.delete()`](#restsdk-client-delete)
  * [`client.get()`](#restsdk-client-get)
  * [`client.post()`](#restsdk-client-post)
  * [`client.patch()`](#restsdk-client-patch)

---

<a name="module-export-restSdk" />

### restSdk(configurationOptions?): Client

Create an client instance of the SDK.

```javascript
const allthings = require('@allthings/sdk')

const client = allthings.restSdk(configurationOptions)
```

---

<a name="restsdk-client-createagent" />

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
export interface InterfaceAllthingsRestApi {
  readonly delete: MethodHttpDelete
  readonly get: MethodHttpGet
  readonly post: MethodHttpPost
  readonly patch: MethodHttpPatch

  // Agent

  /**
   * Create a new agent. This is a convenience function around
   * creating a user and adding that user to a property-manager's team
   */
  readonly createAgent: MethodCreateAgent

  /**
   * Create agent permissions. This is a convenience function around
   * creating two user permission's: one "admin" and the other "pinboard"
   */
  readonly createAgentPermissions: MethodCreateAgentPermissions

  // App

  /**
   * Create a new App.
   */
  readonly createApp: MethodCreateApp

  // ID Lookup

  /**
   * Map one or more externalId's to API ObjectId's within the scope of a specified App
   */
  readonly createIdLookup: MethodCreateIdLookup

  // Group

  /**
   * Create a new group within a property
   */
  readonly createGroup: MethodCreateGroup

  /**
   * Get a group by it's ID
   */
  readonly getGroupById: MethodGetGroupById

  /**
   * Update a group by it's ID
   */
  readonly updateGroupById: MethodUpdateGroupById

  // Property

  /**
   * Create a new property
   */
  readonly createProperty: MethodCreateProperty

  /**
   * Get a property by it's ID
   */
  readonly getPropertyById: MethodGetPropertyById

  /**
   * Update a property by it's ID
   */
  readonly updatePropertyById: MethodUpdatePropertyById

  // Registration Code

  /**
   * Create a new registration code
   */
  readonly createRegistrationCode: MethodCreateRegistrationCode

  // Unit

  /**
   * Create a unit within a group
   */
  readonly createUnit: MethodCreateUnit

  /**
   * Get a unit by it's ID
   */
  readonly getUnitById: MethodGetUnitById

  /**
   * Update a unit by it's ID
   */
  readonly updateUnitById: MethodUpdateUnitById

  // User

  /**
   * Create a new User.
   */
  readonly createUser: MethodCreateUser

  /**
   * Give a user a permission/role on an given object of specified type
   */
  readonly createUserPermission: MethodCreateUserPermission

  /**
   * Delete a user a permission/role on an given object of specified type
   */
  readonly deleteUserPermission: MethodDeleteUserPermission

  /**
   * Get a list of users
   */
  readonly getUsers: MethodGetUsers

  /**
   * Get the current user from active session
   */
  readonly getCurrentUser: MethodGetCurrentUser

  /**
   * Get a user by their ID
   */
  readonly getUserById: MethodGetUserById

  /**
   * Get a list of user's permissions
   */
  readonly getUserPermissions: MethodGetUserPermissions

  /**
   * Update a user by their ID
   */
  readonly updateUserById: MethodUpdateUserById

  // Utilisation Period

  /**
   * Create a new utilisation period within a Unit
   */
  readonly createUtilisationPeriod: MethodCreateUtilisationPeriod

  /**
   * Get a utilisation period by it's ID
   */
  readonly getUtilisationPeriodById: MethodGetUtilisationPeriodById

  /**
   * Update a utilisation period by it's ID
   */
  readonly updateUtilisationPeriodById: MethodUpdateUtilisationPeriodById
}
```
