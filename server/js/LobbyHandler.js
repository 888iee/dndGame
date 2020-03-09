const Lobby     = require("./Lobby");
const UserList  = require("./users/UserList");

class LobbyHandler {
    static lobbies = [];
    constructor() {}

    static createLobby(lobbyData, socket, cb) {
        if(this.doesLobbyExist(lobbyData.roomName)) {
            console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
            socket.emit("msg", "Room already exist!");
        } else {
            let lob = new Lobby(lobbyData);
            lob.addPlayer(UserList.getUser(socket.id));
            this.lobbies.push(lob);
        }
    }

    static doesLobbyExist(roomName) {
        for(let lob in this.lobbies) {
            if(lob.roomName === roomName) {
                return true;
            }
        }
        return false;
    }

    static getLobbyByName(roomName) {
        return this.lobbies.find(lob => lob.roomName === roomName);
    }

    // Returns Room Object
    static getLobbyBySocket(sock) {
        for(let lob in this.lobbies) {
            if(lob.isPlayerInRoom(sock.id)) {
                return lob;
            }
        }
    }
    
    static getPlayersInLobby(roomName) {
        this.getLobbyByName(roomName).getPlayers();
    }

    static joinLobby(data, cb) {
        let usr = UserList.getUser(data.socket.id);
        // check lobby exists
        if(this.doesLobbyExist(data.roomName)) {
            let lob = this.getLobbyByName(data.roomName);
            // check lobby is full
            if(!lob.isLobbyFull()) {
                lob.addPlayer(usr);
                cb();
                io.in(data.roommName).emit("addPlayer", lob.getPlayers());
                console.log(`${data.socket.id} ist ${data.roomName} beigetreten.`)
            } else {
                console.log(`${data.socket.username} tried to join full room.`)
            }
        } else {
            console.log(`ERROR\n${data.socket.username} tried to join not existing room.`)
        }
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