# Lobby Object

| Property | DataType | Description |
|:--|:--| :-- |
|roomName|String|Name of the Room|
|leader | String | Session ID of the leader |
|max_players|Integer| maximum amount of players in this lobby|
|password|String|Password if set|
|public|Boolean|True if public else private|
|chars|Object| Amount of selectable Characters |
|canIJoin | Boolean | True if max_players not reached |

| Methods      | Description                |
|:--|:--| :-- |
| checkIfAllPlayersAreReady | Returns Boolean |
| checkIfChampSelectCanStart | Returns Boolean |
| didRoomReachMaxPlayers | Returns Boolean |
| getPlayerCount | Returns actual size of Room |
| getPlayersInRoom | Returns array of Users |
| getReadyStateInRoom | Returns Boolean if all Players are ready |
| IsPlayerInRoom | Returns Boolean |
| RemovePlayer | Removes Player |
| selectCharacter | lets user select Character |
| setReadyState | Sets ready state of player |
