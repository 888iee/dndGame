# User Object

---

| Property   | Datatype |
| :--------- | :------- |
| socket     | object   |
| username   | String   |
| sessionID  | String   |
| originalID | String   |
| roomName   | String   |
| char       | String   |
| ready      | boolean  |
| leader     | boolean  |
| online     | true     |

| Functions      | Description                |
| :------------- | :------------------------- |
| addUser        | Adds User                  |
| isLeader       | Returns boolean            |
| isReady        | Returns boolean            |
| joinRoom       | Adds User to Room          |
| leaveRoom      | Removes User from Room     |
| makeLeader     | Grants User Lead for Room  |
| removeUser     | Removes User               |
| removeLeader   | Revokes User Lead for Room |
| setCharacter   | Sets Character for User    |
| setReady       | Sets Ready to true         |
| unsetCharacter | Unsets Character to User   |
| unsetReady     | Unsets Ready to true       |
| getUser        | ?                          |
|                |                            |
|                |                            |
