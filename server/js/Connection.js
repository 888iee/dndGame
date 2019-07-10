let Connection = (io) => {
    let users = {};
    let chars = {};
    const Lobby = require("./Lobby");
    let lobby = new Lobby(io);

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
            let room = lobby.returnRoomFromSock(sock);
            sock.emit("getChat", `Wilkommen im Raum <br>${room}.`);
            sock.broadcast.to(room).emit("getChat", `${sock.username} ist dem Raum beigetreten.`);
        });
    }

    io.on("connection", (socket) => {
        users[socket.id] = socket;
        socket.emit("id", socket.id);
        socket.on("createRoom", (roomData) => {
            try {
                // assigns socket to leader 
                roomData.leader = createUsrObj(socket);
                lobby.creatingRoom(roomData, socket, () => {
                    // socket joins room
                    socket.join(roomData.roomName);
                    // emit room display to client
                    socket.emit("openRoom", roomData);
                    socket.emit("addPlayer", [{
                        "name": socket.username
                    }]);
                    welcomeToRoomMsg(socket);
                });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("joinToRoom", data => {
            // try {
            data.socket = socket;
            lobby.joiningRoom(data, () => {

                // socket joins room
                socket.join(data.roomName);
                // try {
                // emit room display to client
                setTimeout(() => {
                    try {
                        socket.emit("openRoom", data.roomName);
                    } catch (error) {
                        console.log(error)
                    }
                    io.in(data.roomName).emit("addPlayer", lobby.getPlayersInRoom(data.roomName, users));
                    console.log(`${socket.id} ist ${Object.keys(users[socket.id].rooms).find(room => room !== socket.id)} beigetreten.`)
                }, 0)

                welcomeToRoomMsg(socket);
            });
        });



        socket.on("getChat", (data) => {
            let roomName = lobby.returnRoomFromSock(socket);
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


        // !! UPDATE LOOP !!
        // TODO: Change Interval time after debugging
        setInterval(() => {
            // check if socket is in room
            // if not send getList package
            let roomKeys = Object.keys(socket.rooms);
            for (let i = 0; i < lobby.rooms.length; i++) {
                if (!roomKeys.includes(lobby.rooms[i].roomName)) {
                    socket.emit("getList", getRoomList());
                }
            }
        }, 2000);


        socket.on("disconnect", () => {
            try {
                let num = getIndexByUsrId(socket.id);
                rooms[num].player_count--;

            } catch (error) {
                console.log("No Room to leave error occured");
            }
            delete users[socket.id];
            console.log(`${socket.username} has been disconnected. [${socket.id}]`);
        })
    });

    let splitPassedCookiesData = (data) => {
        return data.split("&&");
    }

    // returns actual size of room
    let getPlayerCount = (roomName) => {
        try {
            return io.sockets.adapter.rooms[roomName].length;

        } catch (error) {
            return 1;
        }
    }
    let getRoomList = () => {
        let package = [];
        // console.log(`roomsList: \n ${rooms[0].roomName}`)
        for (let i = 0; i < lobby.rooms.length; i++) {
            let canIJoin = lobby.rooms[i].player_count < lobby.rooms[i].max_players;
            // setTimeout(() => {
            package.push({
                "roomName": lobby.rooms[i].roomName,
                "public": lobby.rooms[i].public,
                "player_count": getPlayerCount(lobby.rooms[i].roomName),
                "max_players": lobby.rooms[i].max_players,
                "leader": lobby.rooms[i].leader,
                "canIJoin": canIJoin
            })
            // }, 100)

        }
        return package;
    }
}
module.exports = Connection;