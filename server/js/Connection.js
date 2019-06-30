let Connection = (io) => {

    let users = {}

    // contains room objects
    let rooms = [
        // {
        //     "roomName": "123",
        //     "password": "",
        //     "public": true,
        //     "player_count": 2,
        //     "max_players": 2,
        //     "leader": "you",
        //     "players": ["you"]
        // }
        // , {
        //     "roomName": "asda",
        //     "password": "",
        //     "public": false,
        //     "actual_players": 1,
        //     "players": 2,
        //     "leader": "me"
        // }
    ]
    let roomFlag;

    // returns actual size of room
    let getPlayerCount = (roomName) => {
        return io.sockets.adapter.rooms[roomName].length;
    }

    // get players in room
    let getPlayersInRoom = (name) => {
        let members = [];
        Object.keys(io.sockets.adapter.rooms[name].sockets).forEach((id) => {
            members.push({
                "name": users[id].username,
            })

        });
        return members;
    }

    // returns room
    let findRoom = (name) => {
        return rooms.find(room => room.roomName === name);
    }
    // !! DEPRECRATED
    // retuns index of room
    // let getIndexByUsrId = (id) => {
    //     return rooms.findIndex(room => room.players.find(player => player == id));
    // }
    let retunRoomFromSock = (sock) => {
        return Object.keys(sock.rooms).filter(key => key !== sock.id);
    }
    // creates object of client information 
    let createUsrObj = (socket) => {
        return {
            sessionID: socket.id,
            usr: users[socket].username,
            orID: users[socket].originID
        }
    }

    // sends welcome msg to client and broadcast to 
    // all other members of client's room a notification
    let welcomeToRoomMsg = (sock) => {
        setTimeout(() => {
            let room = retunRoomFromSock(sock);
            sock.emit("getChat", `Wilkommen im Raum <br>${room}.`);
            sock.broadcast.to(room).emit("getChat", `${sock.username} ist dem Raum beigetreten.`);
        });
    }

    // let socket join specific room
    let joinToRoom = (data, cb) => {
        let sock = data.sock;
        let room = data.roomData;
        if (data.create) {
            // socket joins room
            sock.join(room.roomName);
            // assigns socket to leader and push to players
            room.leader = createUsrObj(sock);
            // room.players = [];
            // room.players.push(room.leader);
            // emit room display to client
            sock.emit("openRoom", room);
            sock.emit("addPlayer", [{
                "name": sock.username
            }]);
            welcomeToRoomMsg(sock);
            // add room to global array
            rooms.push(room);
        } else {
            // socket joins room
            sock.join(room.roomName);
            // emit room display to client
            sock.emit("openRoom", room);
            // return list;
            welcomeToRoomMsg(sock);
            console.log("my output")
            console.log(getPlayersInRoom(room.roomName))
            // process.nextTick(() => io.in(room.roomName).emit("addPlayer", getPlayersInRoom(room.roomName)));
            setTimeout(() => io.in(room.roomName).emit("addPlayer", getPlayersInRoom(room.roomName)), 300)
        }
    }
    io.on("connection", (socket) => {
        users[socket.id] = socket;

        socket.on("createRoom", (roomData) => {
            console.log(`Room Data => ${roomData.roomName}:${roomData.password}`)
            if (findRoom(roomData.roomName)) {
                console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
                socket.emit("msg", "Room already exist!");
            } else {
                let data = {
                    create: true,
                    sock: socket,
                    roomData: roomData,
                }
                joinToRoom(data);
            }
        });
        socket.on("getChat", (data) => {
            let roomName = retunRoomFromSock(socket);
            io.to(roomName).emit("getChat", `${socket.username}: ${data}`);
        });

        socket.on("cookieCreated", (data) => {
            let arr = splitPassedCookiesData(data);
            users[arr[0]] = socket;
            users[arr[0]].clientID = socket.id;
            users[arr[0]].username = arr[1];
            socket.emit("getList", getRoomList());
            console.log(`${socket.username} [id=${socket.id}] has been registered`);
        });
        socket.on("authenticate", (data) => {
            socket.emit("getList", getRoomList());
            let arr = splitPassedCookiesData(data);
            users[socket] = socket;
            users[socket].clientID = socket.id;
            users[socket].username = arr[1];
            users[socket].originID = arr[0];
            console.log(`${socket.username} [id=${socket.id}] has been authenticated`);
        });
        socket.on("reqList", () => {
            socket.emit("getList", getRoomList());
            console.log("reqlist sent")
        });

        socket.on("joinToRoom", data => {
            let room = findRoom(data.name);
            console.log(`${socket.username} asked to join a room`);
            if (room) {
                if (getPlayerCount(room.roomName) < room.max_players) {
                    let package = {
                        sock: socket,
                        roomData: {
                            "roomName": data.name,
                            "public": data.public
                        },
                    }
                    joinToRoom(package, () => {
                        console.log(`${socket.username} joined Room ${package.roomData.name}.`)
                    });
                    console.log(getPlayersInRoom(room.roomName))
                } else {
                    console.log(`${socket.username} tried to join full room.`)
                }
            } else {
                console.log(`ERROR\n${socket.username} tried to join not existing room.`)
            }
        });
        socket.on("selected", (data) => {
            let chararacters = require("../../client/js/characters");
            let roomName = retunRoomFromSock(socket);
            // console.log(cha)data.replace("c", "")
            io.to(roomName).emit("getChat", `${socket.username} spielt nun ${chararacters[data.replace("c", "")].name}`);
        });

        // !! UPDATE LOOP !!
        // TODO: Change Interval time after debugging
        setInterval(() => {
            // check if socket is in room
            // if not send getList package
            let roomKeys = Object.keys(socket.rooms);
            for (let i = 0; i < rooms.length; i++) {
                if (!roomKeys.includes(rooms[i].roomName)) {
                    socket.emit("getList", getRoomList());
                }
            }


        }, 2000);


        socket.on("disconnect", () => {
            console.log(`${socket.username} has been disconnected. [${socket.id}]`);
            try {
                let num = getIndexByUsrId(socket.id);
                // socket.leave(rooms[num].roomName);
                rooms[num].player_count--;
                rooms[num].players.splice(num, 1);
            } catch (error) {
                console.log("No Room to leave error occured");
            }
            delete users[socket.id];
        })
    });

    io.of("/g").on("connection", (socket) => {
        socket.emit("msg", "you are in namespace g");
    })

    let splitPassedCookiesData = (data) => {
        return data.split("&&");
    }

    let getRoomList = () => {
        let package = [];
        // console.log(`roomsList: \n ${rooms[0].roomName}`)
        for (let i = 0; i < rooms.length; i++) {
            let canIJoin = rooms[i].player_count < rooms[i].max_players;
            package.push({
                "roomName": rooms[i].roomName,
                "public": rooms[i].public,
                "player_count": getPlayerCount(rooms[i].roomName),
                "max_players": rooms[i].max_players,
                "leader": rooms[i].leader,
                "canIJoin": canIJoin
            })

        }
        return package;
    }
}
module.exports = Connection;