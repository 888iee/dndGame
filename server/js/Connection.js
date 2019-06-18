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

    // returns room
    let findRoom = (name) => {
        return rooms.find(room => room.roomName === name);
    }
    // retuns index of room
    let findRoomByUsrId = (id) => {
        return rooms.findIndex(room => room.players.find(player => player == id));
    }
    
    // creates object of client information 
    let createUsrObj = (socket) => {
        return {
            clID: users[socket].clientID,
            usr: users[socket].username,
            orID: users[socket].originID
        }
    }

    let joinToRoom = (data) => {
        data.socket.join(data.name);
        findRoom(data.name).player_count++;
        findRoom(data.name).players.push(createUsrObj(data.socket));
        console.table(findRoom(data.name).players);
        // console.table(roomData.players)
    }
    io.on("connection", (socket) => {
        console.log(socket.id)
        socket.on("createRoom", (roomData) => {
            console.log(`Room Data => ${roomData.roomName}:${roomData.password}`)
            if (findRoom(roomData.roomName)) {
                console.log(`${socket.id} tried to create an already existing Room \n=> ${roomData.roomName}`)
                socket.emit("msg", "Room already exist!");
            } else {
                // !! Settings for Room
                roomData.player_count = 1;
                roomData.leader = socket.id;


                roomData.players = [createUsrObj(socket)];
                rooms.push(roomData);

                // Let leader join room
                socket.join(roomData.roomName);
                socket.emit("openRoom", roomData);

                // changes flag to broadcast new room
                roomFlag = true;

                // ! test message
                socket.emit("getChat", `Welcome to ${roomData.roomName}`);
                console.table(roomData);

            }
        });
        socket.on("getChat", (data) => {
            let roomName = findRoomByUsrId(socket.id);
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
                if (room.player_count < room.max_players) {
                    if (room.players.includes(socket.id)) {

                    } else {

                        data.socket = socket;
                        joinToRoom(data);
                        console.log(`${socket.username} joined Room ${data.name}.`)
                        socket.emit("openRoom", room);
                        console.table(room.players);
                    }
                } else {
                    console.log(`${socket.username} tried to join full room.`)
                }
            } else {
                console.log(`ERROR\n${socket.username} tried to join not existing room.`)
            }
        })



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
                let num = findRoomByUsrId(socket.id);
                socket.leave(rooms[num].roomName);
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
                "player_count": rooms[i].player_count,
                "max_players": rooms[i].max_players,
                "leader": rooms[i].leader,
                "canIJoin": canIJoin
            })

        }
        return package;
    }
}
module.exports = Connection;