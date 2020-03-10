class Lobby {
    constructor(data, io) {
        this.roomName       = data.roomName;
        this.leader         = data.leader;
        this.max_players    = data.max_players;
        this.playerCount    = 1;
        this.password       = data.password;
        this.public         = data.public;
        this.canIJoin       = data.canIJoin;
        this.players        = [];
        this.chars          = {
            c1: "none",
            c2: "none",
            c3: "none",
            c4: "none",
            c5: "none",
        };
        
        this.io = io;
    }
    
    addPlayer(user) {
        this.players.push(user);
        if(user.getID() !== this.leader) {
            this.playerCount++;
        }
        user.joinRoom(this.roomName);
    }

    checkIfAllPlayersAreReady() {
        for(let player in this.players) {
            if (!player.ready) {
                return false;
            }
        }
        return true;
    }


    checkIfChampSelectCanStart() {
        // if (this.isLobbyFull()) {
        if(true) {
            // TODO: returns values need to be updated
            this.io.to(this.roomName).emit("startSelect", this.chars);
            return true;
        }
    }

    isLobbyFull() {
        if (this.getPlayerCount() == this.max_players) {
            return true;
        }
    }
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    // returns actual size of room
    getPlayerCount() {
        return this.playerCount;
    }

    // get players in room
    getPlayers() {
        return this.players;
    }

    getRoomName() {
        return this.roomName;
    }

    // returns true if player is in room
    isPlayerInRoom(playerId) {
        let isInside = this.players.find(usr => usr.getID() == playerId);
        if (isInside == null) {
            return false;
        }
        return true;
    }

    // remove player from room
    removePlayerInRoom(roomName, username) {
        // TODO: User muss entfernt werden aus room und check if leader and choose new lead

        // delete this.rooms[this.findRoomIndex(roomName)].users.find(usr => usr == username);
        // this.io.sockets.adapter.rooms[name].sockets
        try {
            this.io.in(roomName).emit("addPlayer", this.getPlayersInRoom(roomName, users));
        } catch (error) {
            console.log(error);
        }
    }

    removeRoom(count) {
        this.rooms.splice(count, 1);
    }

    selectCharacter(socket, char, cb) {
        // check if champ select can start already
        if (this.checkIfChampSelectCanStart()) {
            // check if chars[char.id] is selected by none
            if (this.chars[char.id] === "none") { //funktionert wenn man this.rooms[0] nutzt statt room
                // deselect previous char
                if (this.chars[this.getKeyByValue(this.chars, socket.username)]) {
                    this.chars[this.getKeyByValue(room.chars, socket.username)] = "none"
                }
                // select new char
                this.chars[char.id] = socket.username;
                socket.char = char.name;
                socket.broadcast.to(this.roomName).emit("getChat", `${socket.username} hat ${char.name} ausgewählt.`)
                this.io.in(this.roomName).emit("addPlayer", this.getPlayers());
            } else {
                // check if selected char should be unchecked
                if (this.chars[char.id] === socket.username) {
                    // deselect char
                    this.chars[char.id] = "none";
                    socket.char = "none";
                }
            }
            this.io.in(this.roomName).emit("addPlayer", this.getPlayersInRoom());
            this.io.to(this.roomName).emit("selection", this.chars);
            console.log(this.chars)
        }
    }

    // set ready state for player
    setReadyState(bool, sockId) {
        // iterate over rooms
        for (let r in this.rooms) {
            // iterate over characters
            for (let c in r.chars) {
                if (r.chars[c] == sockId) {
                    r.users.find(u => u.id == sockId).ready = bool;
                }
            }
        }
    }
}

module.exports = Lobby;