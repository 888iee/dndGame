class Lobby {
    constructor(io) {
        this.io = io;
        this.rooms = [];

    }

    checkIfAllPlayersAreReady(roomName) {
        this.getReadyStateInRoom(this.getRoomByName(roomName));
    }
    

    checkIfChampSelectCanStart(roomName) {
        if (this.didRoomReachMaxPlayers(roomName)) {
            this.io.to(roomName).emit("startSelect", this.getRoomByName(roomName).chars);
            return true;
        }
    }

    creatingRoom(roomData, socket, cb) {
        if (this.getRoomByName(roomData.roomName)) {
            console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
            socket.emit("msg", "Room already exist!");
        } else {
            roomData.chars = {
                c1: "none",
                c2: "none",
                c3: "none",
                c4: "none",
                c5: "none",
            };
            let data = {
                create: true,
                sock: socket,
                roomData: roomData,

            }
            this.joinToRoom(data, cb);
        }
    }

    didRoomReachMaxPlayers(roomName) {
        let room = this.getRoomByName(roomName);

        if (this.getPlayerCount(roomName) == room.max_players) {
            return true;
        }
    }

    findRoomIndex(name) {
        return this.rooms.findIndex(room => room.roomName === name);
    }

    getIndexByName(name) {
        return this.rooms.findIndex(obj => obj.roomName === name);
    }

    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    // returns actual size of room
    getPlayerCount(roomName) {
        return this.io.sockets.adapter.rooms[roomName].length;
    }

    // get players in room
    getPlayersInRoom(name, users, bool, bool2) {
        let members = [];
        try {
            // try catch because it can fail to find room when users disconnected
            Object.keys(this.io.sockets.adapter.rooms[name].sockets).forEach((id) => {
                let obj = {
                    "name": users[id].username,
                    "character": users[id].char,
                }
                if (bool) {
                    obj["rdy"] = users[id].rdy;
                }
                if (bool2) {
                    obj["originID"] = users[id].originID;
                }
                members.push(obj);

            });
            return members;
        } catch (error) {
            // console.log(error);
        }
    }


    // returns room
    getR(sock) {
        return users[sock.id].rooms.find(name => name !== sock.id);
    }

    // returns room
    getRoomByName(name) {
        return this.rooms.find(room => room.roomName === name);
    }

    // Returns Room Object
    getRoomBySock(sock) {
        return this.rooms.find(room => room.roomName == sock.raum);
    }

    // Returns True if all Players are ready
    getReadyStateInRoom(room) {
        // iterate over users in room
        for(let u in room.users) {
            // check if players are ready
            // return if not
            if(!u.ready) {
                return false;
            }
        }
        return true;
    }

    // returns true if player is in room
    isPlayerInRoom(room, playerId) {
        let isInside = room.users.find(usr => usr == playerId);
        if(isInside == null) {
            return false;
        }
        return true;
    }

    joiningRoom(data, cb) {
        let room = this.getRoomByName(data.roomName);
        if (room) {
            if (this.getPlayerCount(room.roomName) < room.max_players) {
                let pack = {
                    sock: data.socket,
                    roomData: {
                        "roomName": data.roomName,
                        "public": data.public
                    },
                }
                this.joinToRoom(pack, cb);
            } else {
                console.log(`${data.socket.username} tried to join full room.`)
            }
        } else {
            console.log(`ERROR\n${data.socket.username} tried to join not existing room.`)
        }
    }

    // let socket join specific room
    joinToRoom(data, cb) {
        let sock = data.sock;
        let room = data.roomData;
        room.users = [];
        room.users.push({"id": sock.id, "origId": sock.originID, "userName": sock.userName, "character": "none",  "ready": false});
        if (data.create) {
            cb()
            // add room to global array
            this.rooms.push(room);
            sock.raum = room.roomName;
            console.log(`Room ${room.roomName} was created with pass: ${room.password}`)
        } else {
            sock.raum = room.roomName;
            cb();
            // this.io.to(sock).emit("addPlayer", this.getPlayersInRoom(room.roomName, room.users));
            this.io.to(sock).emit("addPlayer", room.users);
            console.log(`${sock.username} joined the room ${sock.raum}`);
        }
        this.checkIfChampSelectCanStart(room.roomName);
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
        let room = this.getRoomBySock(socket);
        // check if champ select can start already
        if (this.checkIfChampSelectCanStart(room.roomName)) {
                // check if chars[char.id] is selected by none
                if (room.chars[char.id] === "none") { //funktionert wenn man this.rooms[0] nutzt statt room
                    // deselect previous char
                    if (room.chars[this.getKeyByValue(room.chars, socket.username)]) {
                        room.chars[this.getKeyByValue(room.chars, socket.username)] = "none"
                }
                // select new char
                room.chars[char.id] = socket.username;
                socket.char = char.name;
                socket.broadcast.to(room).emit("getChat", `${socket.username} hat ${char.name} ausgewählt.`)
                this.io.in(room).emit("addPlayer", this.getPlayersInRoom(room, room.users));
            } else {
                // check if selected char should be unchecked
                if (room.chars[char.id] === socket.username) {
                    // deselect char
                    room.chars[char.id] = "none";
                    socket.char = "none";
                }
            }
            cb();
            console.log(room.chars)
        } 
    }

    // set ready state for player
    setReadyState(bool, sockId) {
        // iterate over rooms
        for(let r in this.rooms) {
            // iterate over characters
            for(let c in r.chars) {
                if(r.chars[c] == sockId) {
                    r.users.find(u => u.id == sockId).ready = bool;
                }
            }
        }
    }
}

module.exports = Lobby;
