// Dependencies
const Game          = require("./game/Game");
const LobbyHandler  = require("./LobbyHandler");
const UserList      = require("./users/UserList");

let Connection = (io) => {

    // sends welcome msg to client and broadcast to 
    // all other members of client's room a notification
    let welcomeToRoomMsg = (sock) => {
        setTimeout(() => {
            let lobbyName = LobbyHandler.getLobbyBySocket(sock).getRoomName();
            // Welcome Message for Player
            sock.emit("getChat", `Wilkommen im Raum <br>${lobbyName}.`);
            // Notification in Chat for other Room Members
            sock.broadcast.to(lobbyName).emit("getChat", `${sock.username} ist dem Raum beigetreten.`);
        });
    }

    // io connection
    io.on("connection", (socket) => {
        UserList.addUser(socket);
        // send socket.id to client
        socket.emit("id", socket.id);

        // create Room Event
        socket.on("createRoom", (roomData) => {
            // try {
                // assigns socket to leader 
                roomData.leader = socket.id;
                LobbyHandler.createLobby(roomData, socket, () => {
                    // socket joins room
                    socket.join(roomData.roomName);
                    // emit room display to client
                    socket.emit("openRoom", roomData);
                    socket.emit("addPlayer", [{
                        "name": socket.username
                    }]);
                    welcomeToRoomMsg(socket);
                });
            // } catch (error) {
            //     console.log(error);
            // }
        });

        // Player joining Room Event
        socket.on("joinToRoom", data => {
            data.socket = socket;
            LobbyHandler.joinLobby(data, () => {
                // socket joins room
                socket.join(data.roomName);
                // emit room display to client
                setTimeout(() => {
                    try {
                        socket.emit("openRoom", data.roomName);
                    } catch (error) {
                        console.log(error)
                    }
                }, 0);

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
            let roomName = LobbyHandler.getLobbyBySocket(socket);
            io.to(roomName).emit("getChat", `${socket.username}: ${data}`);
        });

        socket.on("cookieCreated", (data) => {
            let arr = splitPassedCookiesData(data);
            let usr = UserList.getUser(socket.id);
            usr.setName(arr[1]);
            usr.setOriginalId(socket.id);
            socket.emit("getList", getRoomList());
            console.log(`${arr[1]} [id=${socket.id}] has been registered`);
        });
        socket.on("authenticate", (data) => {
            socket.emit("getList", getRoomList());
            let arr = splitPassedCookiesData(data);
            let usr = UserList.getUser(socket.id);
            usr.setName(arr[1]);
            usr.setOriginalId(arr[0]);
            console.log(`${arr[1]} [id=${socket.id}] has been authenticated`);
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
            if (UserList.getUser(socket.id).getState() !== "IN LOBBY") {
                if(LobbyHandler.updateLobbyList) {
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
            // let disconUser = socket;
            // if (typeof disconUser.raum !== undefined) {
            //     console.log(`${disconUser.username} wird Raum ${disconUser.raum} verlassen.`);
            //     disconUser.broadcast.in(disconUser.raum).emit("getChat", `${disconUser.username} hat den Raum verlassen.`);
            //     // lobby.removePlayerInRoom(data.roomName, users);
            //     io.in(disconUser.raum).emit("addPlayer", lobby.getPlayersInRoom(disconUser.raum, this.users));
            //     lobby.removePlayerInRoom(disconUser.raum, disconUser.username);
            // }
            // // delete this.users[disconUser.id];
            // console.log(`${disconUser.username} has been disconnected. [${disconUser.id}]`);
        })
    });

    let splitPassedCookiesData = (data) => {
        return data.split("&&");
    }

    let getRoomList = () => {
        
        // let package = [];
        // for (let i = 0; i < lobby.rooms.length; i++) {
        //     try {
        //         let player_count = lobby.getPlayerCount(lobby.rooms[i].roomName);
        //         let canIJoin = player_count < lobby.rooms[i].max_players;
        //         package.push({
        //             "roomName": lobby.rooms[i].roomName,
        //             "public": lobby.rooms[i].public,
        //             "player_count": player_count,
        //             "max_players": lobby.rooms[i].max_players,
        //             "leader": lobby.rooms[i].leader,
        //             "canIJoin": canIJoin
        //         });
        //     } catch (error) {
        //         lobby.removeRoom(i);
        //         continue
        //     }
        // }
        return LobbyHandler.getAllLobbies();
    }
}
module.exports = Connection;