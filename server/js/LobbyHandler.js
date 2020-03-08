const Lobby = require("./Lobby");
class LobbyHandler {
    static lobbies = [];
    constructor() {}

    static createLobby() {
        this.lobbies.push(new Lobby());
    }

    static getLobbyByName(roomName) {
        return this.lobbies.find(lob => lob.roomName === roomName);
    }

    static getPlayersInLobby(roomName) {
        this.getLobbyByName(roomName).getPlayers();
    }

    static joinLobby(roomName, user) {
        this.getLobbyByName(roomName).addPlayer(user);
    }

    static removeLobby(roomName) {
        let lob = this.getLobbyByName(roomName);
        if(typeof lob != undefined) {
            this.lobbies.splice(this.lobbies.indexOf(lob), 1);
        }
    }

    // retrieves non-sensitive data to clients
    static getAllLobbies() {
        let list = [];
        for(let i in this.lobbies) {
            list.push({
                roomName: i.roomName,
                max_players: i.max_players,
                playerCount: i.playerCount,
                public: i.public,
                canIJoin: i.canIJoin
            })
        }
        return list;
    }
}
module.exports = LobbyHandler;