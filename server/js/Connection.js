// Dependencies
const Game              = require("./game/Game");
const LobbyHandler      = require("./LobbyHandler");
const UserList          = require("./users/UserList");
const Message           = require("./Message");

let Connection = (io) => {
    let Msg = new Message();
    LobbyHandler.setIO(io);


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
                    Msg.welcomeToRoomMessage(socket);
                });
        });

        // Player joining Room Event
        socket.on("joinToRoom", async data => {
            data.socket = socket;
            await LobbyHandler.joinLobby(data, () => {
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

                Msg.welcomeToRoomMessage(socket);
            });
        });

        socket.on("select", char => {
            try {
                if(UserList.getUser(socket.id).getState() === "IN LOBBY") {
                    LobbyHandler.getLobbyBySocket(socket).selectCharacter(socket, char);
                }
            } catch (error) {
                console.log(error);
            }
        });
        
        socket.on("rdy", bool => {
            try {
                if(UserList.getUser(socket.id).getState() === "IN LOBBY") {
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
                }
            } catch (error) {
                console.log(error);
            }
        });

        // data passed to Message.js
        socket.on("getChat", (data) => Message.getChat(socket, data));

        socket.on("cookieCreated", (data) => {
            let arr = splitPassedCookiesData(data);
            let usr = UserList.getUser(socket.id);
            usr.setName(arr[1]);
            usr.setOriginalId(socket.id);
            socket.emit("getList", getLobbyList());
            console.log(`${arr[1]} [id=${socket.id}] has been registered`);
        });
        socket.on("authenticate", (data) => {
            socket.emit("getList", getLobbyList());
            let arr = splitPassedCookiesData(data);
            let usr = UserList.getUser(socket.id);
            usr.setName(arr[1]);
            usr.setOriginalId(arr[0]);
            console.log(`${arr[1]} [id=${socket.id}] has been authenticated`);
        });
        socket.on("reqList", () => {
            socket.emit("getList", getLobbyList());
            console.log("reqlist sent")
        });


        // !! UPDATE LOOP !!
        // TODO: Change Interval time after debugging
        setInterval(() => {
            // check if socket is in room
            // if not send getList package
            if (UserList.getUser(socket.id).getState() !== "IN LOBBY") {
                if(LobbyHandler.updateLobbyList) {
                    socket.emit("getList", getLobbyList()); 
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

    // returns LobbyList to socket
    let getLobbyList = () => LobbyHandler.getAllLobbies();
}
module.exports = Connection;