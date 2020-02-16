let Connection = (io) => {
    const Game = require("./game/Game");
    let users = {};

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
            let room = lobby.getRoomBySock(sock);
            // Welcome Message for Player
            sock.emit("getChat", `Wilkommen im Raum <br>${room.roomName}.`);
            // Notification in Chat for other Room Members
            sock.broadcast.to(room.roomName).emit("getChat", `${sock.username} ist dem Raum beigetreten.`);
        });
    }

    // io connection
    io.on("connection", (socket) => {
        // initial SetParams
        users[socket.id] = socket;
        socket.char = "none";
        socket.rdy = false;
        // send socket.id to client
        socket.emit("id", socket.id);

        // create Room Event
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

        // Player joining Room Event
        socket.on("joinToRoom", data => {
            data.socket = socket;
            lobby.joiningRoom(data, () => {

                // socket joins room
                socket.join(data.roomName);
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

        socket.on("select", char => {
            lobby.selectCharacter(socket, char, cb => {

                let room = lobby.getRoomBySock(socket);
                // send to all clients in room 

                io.in(room.roomName).emit("addPlayer", lobby.getPlayersInRoom(room.roomName, users));
                io.to(room.roomName).emit("selection", room.chars);
            });
        })

        socket.on("rdy", bool => {
            lobby.setReadyState(bool, socket.id);
            socket.rdy = bool;
            if (lobby.checkIfAllPlayersAreReady(socket.raum)) {
                while (true) {
                    console.log("ALL READY");
                }
                // TODO: !!
                checkReady(lobby.getPlayersInRoom(lobby.getRoomBySock(socket), users, true));
            } else {
                console.log("NOT READY");
            }
        });

        socket.on("getChat", (data) => {
            let roomName = lobby.getRoomBySock(socket);
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

        let checkReady = (arReadyCheck) => {
            for (var i in arReadyCheck) {
                if (!arReadyCheck[i].rdy) return console.log("Not all ready yet");
            }
            let roomName = lobby.getRoomBySock(socket).roomName;
            // TODO: start countdown and redirect all sockets.of(room) to game site
            console.log("Everyone is ready\nStarting Game in \n3 \n2 \n1");
            io.to(roomName).emit("getChat", "Spiel startet in..")
            setTimeout(() => {
                io.to(roomName).emit("getChat", 3);
                setTimeout(() => {
                    io.to(roomName).emit("getChat", 2);
                    setTimeout(() => {
                        io.to(roomName).emit("getChat", 1);
                        io.to(roomName).emit("redirect", "/play.html");

                        let raum = lobby.getRoomBySock(socket);
                        raum.member = lobby.getPlayersInRoom(roomName, users, false, true);

                        let game = new Game(io, raum);
                        game.launch();
                    }, 1000);
                }, 1000);
            }, 1000);
        }

        socket.on("disconnect", (reason) => {
            // the disconnection was initiated by the server, you need to reconnect manually
            if (reason === 'io server disconnect') {
                socket.connect();
            }
            let disconUser = socket;
            if (typeof disconUser.raum !== undefined) {
                console.log(`${disconUser.username} wird Raum ${disconUser.raum} verlassen.`);
                disconUser.broadcast.in(disconUser.raum).emit("getChat", `${disconUser.username} hat den Raum verlassen.`);
                // lobby.removePlayerInRoom(data.roomName, users);
                io.in(disconUser.raum).emit("addPlayer", lobby.getPlayersInRoom(disconUser.raum, this.users));
                lobby.removePlayerInRoom(disconUser.raum, disconUser.username);
            }
            // delete this.users[disconUser.id];
            console.log(`${disconUser.username} has been disconnected. [${disconUser.id}]`);
        })
    });

    let splitPassedCookiesData = (data) => {
        return data.split("&&");
    }

    let getRoomList = () => {
        let package = [];
        for (let i = 0; i < lobby.rooms.length; i++) {
            try {
                let player_count = lobby.getPlayerCount(lobby.rooms[i].roomName);
                let canIJoin = player_count < lobby.rooms[i].max_players;
                package.push({
                    "roomName": lobby.rooms[i].roomName,
                    "public": lobby.rooms[i].public,
                    "player_count": player_count,
                    "max_players": lobby.rooms[i].max_players,
                    "leader": lobby.rooms[i].leader,
                    "canIJoin": canIJoin
                });
            } catch (error) {
                lobby.removeRoom(i);
                continue
            }
        }
        return package;
    }
}
module.exports = Connection;