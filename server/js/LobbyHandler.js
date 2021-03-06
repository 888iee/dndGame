const Lobby     = require("./Lobby");
const UserList  = require("./users/UserList");

class LobbyHandler {
    static lobbies = [];
    static updateLobbyList = false;
    static io;

    static createLobby(lobbyData, socket, cb) {
        if(this.doesLobbyExist(lobbyData.roomName)) {
            console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
            socket.emit("msg", "Room already exist!");
        } else {
            let lob = new Lobby(lobbyData, this.io);
            // socket joins room
            socket.join(lobbyData.roomName);
            // emit room display to client
            socket.emit("openRoom", lobbyData);
            // socket.emit("addPlayer", [{username: socket.username, leader: true}]);
            lob.addPlayer(UserList.getUser(socket.id));
            this.lobbies.push(lob);
            cb();
        }
        this.updateLobbyList = true;
    }

    static doesLobbyExist(roomName) {
        for(let i = 0; i < this.lobbies.length; i++) {
            if(this.lobbies[i].roomName === roomName) {
                return true;
            }
        }
        return false;
    }

    static getLobbyByName(roomName) {
        return this.lobbies.find(lob => lob.roomName === roomName);
    }

    // retrieves non-sensitive data to clients
    static getAllLobbies() {
        let list = [];
        for(let i = 0; i < this.lobbies.length; i++) {
            list.push({
                roomName: this.lobbies[i].roomName,
                max_players: this.lobbies[i].max_players,
                playerCount: this.lobbies[i].playerCount,
                public: this.lobbies[i].public,
                canIJoin: this.lobbies[i].canIJoin
            });
        }
        this.updateLobbyList = false;
        return list;
    }
    
    // Returns Room Object
    static getLobbyBySocket(sock) {
        for(let i = 0; i < this.lobbies.length; i++) {
            if(this.lobbies[i].isPlayerInRoom(sock.id)) {
                return this.lobbies[i];
            }
        }
    }
    
    static getPlayersInLobby(roomName) {
        this.getLobbyByName(roomName).getPlayers();
    }

    static async joinLobby(data, cb) {
        let usr = UserList.getUser(data.socket.id);
        // check lobby exists
        if(this.doesLobbyExist(data.roomName)) {
            let lob = this.getLobbyByName(data.roomName);
            // check lobby is full
            if(!lob.isLobbyFull()) {
                lob.addPlayer(usr);
                await cb();
                // setTimeout to let nodejs time to clear the stack
                setTimeout(() => {
                    this.io.in(lob.getRoomName()).emit("addPlayer",  lob.getPlayers());
                }, 0);
                setTimeout(() => {
                    this.getLobbyByName(data.roomName).addPlayer(usr);
                }, 0);
                this.updateLobbyList = true;
                // await console.log(`${data.socket.id} ist ${data.roomName} beigetreten.`);
            } else { 
                console.log(`${data.socket.username} tried to join full room.`)
            }
        } else {
            console.log(`ERROR\n${data.socket.username} tried to join not existing room.`)
        }
    }

    static removeLobby(roomName) {
        let lob = this.getLobbyByName(roomName);
        if(typeof lob != undefined) {
            this.lobbies.splice(this.lobbies.indexOf(lob), 1);
            this.updateLobbyList = true;
        }
    }

    static setIO(io) {
        this.io = io;
    }

}
module.exports = LobbyHandler;