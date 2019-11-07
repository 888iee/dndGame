class Lobby {
    constructor(io) {
        this.io = io;
        this.rooms = [];

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
    }

    getIndexByName(name) {
        return this.rooms.findIndex(obj => obj.roomName === name);
    }
    // returns room
    findRoom(name) {
        return this.rooms.find(room => room.roomName === name);
    }

    findRoomIndex(name) {
        return this.rooms.findIndex(room => room.roomName === name);
    }
    // !! DEPRECRATED
    // retuns index of room
    // let getIndexByUsrId(id) {
    //     return this.rooms.findIndex(room => room.players.find(player => player == id));
    // }
    returnRoomFromSock(sock) {
        return Object.keys(sock.rooms).filter(key => key !== sock.id);
    }
    getR(sock) {
        return users[sock.id].rooms.find(name => name !== sock.id);
    }
    // let socket join specific room
    joinToRoom(data, cb) {
        let sock = data.sock;
        let room = data.roomData;
        if (data.create) {
            cb()
            // add room to global array
            this.rooms.push(room);
            sock.raum = room.roomName;
            console.log(`Room ${room.roomName} was created with pass:${room.password}`)
        } else {
            sock.raum = room.roomName;
            cb()
            console.log(`${sock.username} joined the room ${sock.raum}`);
        }
    }
    creatingRoom(roomData, socket, cb) {
        if (this.findRoom(roomData.roomName)) {
            console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
            socket.emit("msg", "Room already exist!");
        } else {

            let data = {
                create: true,
                sock: socket,
                roomData: roomData,
                chars: {
                    c1: "none",
                    c2: "none",
                    c3: "none",
                    c4: "none",
                    c5: "none",
                }
            }
            this.joinToRoom(data, cb);
        }
    }
    joiningRoom(data, cb) {
        let room = this.findRoom(data.roomName);
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
    // remove player from room
    removePlayerInRoom(roomName, username) {
        this.rooms[roomName]
        this.io.sockets.adapter.rooms[name].sockets
        io.in(data.roomName).emit("addPlayer", lobby.getPlayersInRoom(data.roomName, users));
    }

    removeRoom(count) {
        this.rooms.splice(count, 1);
    }

    selectCharacter(socket) {
        let room = lobby.returnRoomFromSock(socket);
        // check if char.id exist in chars 
        // if (char.id in chars) {
        // check if chars[char.id] is selected by none
        if (room.chars[char.id] === "none") {
            // deselect previous char
            if (room.chars[getKeyByValue(room.chars, socket.username)]) {
                room.chars[getKeyByValue(room.chars, socket.username)] = "none"
            }
            // select new char
            room.chars[char.id] = socket.username;
            socket.char = char.name;
            socket.broadcast.to(room).emit("getChat", `${socket.username} hat ${char.name} ausgewählt.`)
            io.in(room).emit("addPlayer", lobby.getPlayersInRoom(room, users));
        } else {
            // check if selected char should be unchecked
            if (room.chars[char.id] === socket.username) {
                // deselect char
                room.chars[char.id] = "none";
                socket.char = "none";
            }
        }
        console.log(chars)
    }
}
module.exports = Lobby;