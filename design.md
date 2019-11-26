# SDK Design Conventions

## Rest SDK

### Action Verbs

✅get <br/>
❌read <br/>


✅delete <br/>
❌remove <br/>


✅update <br/>
❌change <br/>
❌set <br/>


✅create <br/>
❌generate <br/>


✅add <br/>
❌link<br/>

### Methods

Method names have the naming convention `resourcenameActionverb()`. We place the resource first to improve developer ergonomics: It's easier to find a method if all you know is the resource-type.

✅ `client.userUpdateById(userId, data)`<br/>
❌ `client.updateUserById(userId, data)`<br/>

When two resources are involved, the verb comes before the second resource:

✅ `client.utilisationPeriodCheckInUser(utilisationPeriodId, data)`<br/>
❌ `client.utilisationPeriodUserCheckIn(utilisationPeriodId, data)`<br/>

A method's second argument should always be of type `data: {...}` unless it’s an object ID:

✅ `client.userGetUtilisationPeriods(userId, utilisationPeriodId)`<br/>
✅ `client.utilisationPeriodCheckInUser(userId, { email: '' })`<br/>
❌ `client.utilisationPeriodCheckInUser(userId, emailAddress)`<br/>
