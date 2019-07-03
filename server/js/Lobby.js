class Lobby {
    constructor(io) {
        this.io = io;
        this.rooms = [];

    }
    // creates object of client information 
    createUsrObj(socket) {
        return {
            sessionID: socket.id,
            usr: users[socket].username,
            orID: users[socket].originID
        }
    }
    // returns actual size of room
    getPlayerCount(roomName) {
        return this.io.sockets.adapter.rooms[roomName].length;
    }

    // get players in room
    getPlayersInRoom(name) {
        let members = [];
        Object.keys(this.io.sockets.adapter.rooms[name].sockets).forEach((id) => {
            members.push({
                "name": users[id].username,
            });

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
    joinToRoom(data, socket) {
        let sock = socket;
        let room = data.roomData;
        if (data.create) {
            // assigns socket to leader and push to players
            room.leader = this.createUsrObj(sock);
            // socket joins room
            sock.join(room.roomName);
            // emit room display to client
            sock.emit("openRoom", room);
            sock.emit("addPlayer", [{
                "name": sock.username
            }]);
            welcomeToRoomMsg(sock);
            // add room to global array
            rooms.push(room);
            // console.log(room.players);
        } else {
            // socket joins room
            sock.join(room.roomName);
            // emit room display to client
            sock.emit("openRoom", room);
            setTimeout(() => {
                io.in(room.roomName).emit("addPlayer", getPlayersInRoom(room.roomName));
            }, 300)
            welcomeToRoomMsg(sock);
        }
        setTimeout(() =>
            console.log(`${sock.id} ist ${Object.keys(users[sock.id].rooms).find(room => room !== sock.id)} beigetreten.`), 300);
    }
    creatingRoom(roomData, socket) {
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
            this.joinToRoom(data, socket);
        }
    }
    joiningRoom(data, socket) {
        let room = findRoom(data.name);
        console.log(`${socket.username} asked to join a room`);
        if (room) {
            if (getPlayerCount(room.roomName) < room.max_players) {
                let pack = {
                    sock: socket,
                    roomData: {
                        "roomName": data.name,
                        "public": data.public
                    },
                }
                this.joinToRoom(pack, socket);
            } else {
                console.log(`${socket.username} tried to join full room.`)
            }
        } else {
            console.log(`ERROR\n${socket.username} tried to join not existing room.`)
        }
    }
}
module.exports = Lobby;