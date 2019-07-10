class Lobby {
    constructor(io) {
        this.io = io;
        this.rooms = [];

    }

    // returns actual size of room
    getPlayerCount(roomName) {
        return this.io.sockets.adapter.rooms[roomName].length;
    }

    // get players in room
    getPlayersInRoom(name, users, bool) {
        let members = [];
        Object.keys(this.io.sockets.adapter.rooms[name].sockets).forEach((id) => {
            let obj = {
                "name": users[id].username,
                "character": users[id].char,
            }
            if (bool) {
                obj["rdy"] = users[id].rdy;
            }
            members.push(obj);

        });
        return members;
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
        } else {
            cb()
        }
    }
    creatingRoom(roomData, socket, cb) {
        console.log(`Room Data => ${roomData.roomName}:${roomData.password}`)
        if (this.findRoom(roomData.roomName)) {
            console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
            socket.emit("msg", "Room already exist!");
        } else {
            let data = {
                create: true,
                sock: socket,
                roomData: roomData,
            }
            this.joinToRoom(data, cb);
        }
    }
    joiningRoom(data, cb) {
        console.log(`TRYY > ${data.roomName}`)
        let room = this.findRoom(data.roomName);
        console.log(room);
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
}
module.exports = Lobby;