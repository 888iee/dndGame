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
| state      |  Enum    |

| Functions      | Description                |
| :------------- | :------------------------- |
| changeState    | Changes User State         |
| getID          | Returns ID                 |
| getName        | Returns username           |
| isLeader       | Returns boolean            |
| isReady        | Returns boolean            |
| joinRoom       | Adds User to Room          |
| leaveRoom      | Removes User from Room     |
| makeLeader     | Grants User Lead for Room  |
| revokeLeader   | Revokes User Lead for Room |
| setCharacter   | Sets Character for User    |
| setReady       | Sets Ready to true         |
| unsetCharacter | Unsets Character to User   |
| unsetReady     | Unsets Ready to true       |
|                |                            |
