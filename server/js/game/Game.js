"use strict";

const Player = require("./Player");
class Game {
    constructor(io, room) {
        this.fs = require("fs");
        this.mapData = require("../../lib/map");

        require("../../../client/js/Inventory");

        // connnected users list
        this.users = [];

        // connected players list
        // this.playerList changed to this.playerList
        this.playerList = [];

        // //
        // limit for maxPlayers
        this.maxPlayers = 1;
        // bool for loading map
        this.loadMapTrigger = true;
        // ar for round
        this.order = [];
        // copy of order
        this.roundReset = [];
        // limit for actions
        this.maxActions = 2;
        // bool for starting the game
        this.gameReady = true;

        // TODO: create Phases for looting, battle, etc
        this.preLoadLoop;
        this.io = io;
        this.room = room;
    }

    waitForPlayers() {
        // !! Interval is still active
        let x = setInterval(() => {
            let size = Object.keys(this.users).length;
            if (size == this.maxPlayers && this.loadMapTrigger) {
                clearInterval(x);
                console.log("Player Data has been loaded.")
                this.sendInitToAllClients();
                console.log("Players were initiated.")
                this.createTurn();
                console.log("Round created.")
                size++;
                this.loadMapTrigger = false;
                // process.nextTick(() => )
                this.gameloop()
            }
        }, 2000);

    }

    gameloop() {
        if (this.gameReady && !this.loadMapTrigger) {
            this.gameReady = false;
            let pack;
            // GAME LOOP
            console.log("Game Loop Starting")
            setInterval(function () {
                // iterates through all players
                for (var i in this.playerList) {
                    console.log("intervall")
                    // console.log(`Players name is ${this.playerList[i].name}`)
                    let player = this.playerList[i];
                    // checks if player's turn
                    if (order.length === 0) {
                        // if round haven't started, start it
                        this.startNewRound();
                    } else {
                        // checks if it's the players turn
                        if (player == order[0]) {
                            if (player.dead) {
                                this.nextPlayersTurn();
                            } else {
                                // checks if players max Actions reached
                                if (player.isItMyTurn(maxActions)) {

                                } else {
                                    // if player reached max Actions 
                                    // reset moves
                                    player.resetPlayer();
                                    // let the next players turn begin
                                    this.nextPlayersTurn();
                                }
                            }
                        }
                    }
                    player.updateStats();
                    pack = player.update();
                }
                for (let i in this.users) {
                    this.users[sock].emit("update", pack);
                    console.log("sent")
                }
            }, 1000 / 80);
        }

    }
    // checks if id matches with originID of any member
    checkIfPlayersIsMember(arr) {
        let members = this.room.member;
        return members.find(x => x.originID === arr[0]);
    };

    // returns character from member
    getCharacterSelection(id) {
        let members = this.room.member;
        return members[members.findIndex(x => x.originID == id)].character;
    }


    launch() {
        // assign maxPlayers to variable
        // this.maxPlayers = this.room.max_players;
        this.io.on("connection", socket => {
            socket.on("auth", (data) => {
                let regexCookie = "^[a-zA-Z0-9-_]{20}&&.+$";
                // check if cookie matches syntax
                if (data.match(regexCookie)) {
                    let arr = data.split("&&");
                    // check if user is member of room
                    if (this.checkIfPlayersIsMember(arr)) {
                        this.createUser(socket, arr);
                        showMap();
                        showCanvas();
                    } else {
                        console.log(`${socket.id} is not a Member of Room`);
                        redirect("/");
                    }
                } else {
                    console.log(`${socket.id} has no matching cookie`);
                    redirect("/");
                }
            });

            let showMap = () => {
                socket.emit("loadMap", 0);
            }

            let showCanvas = () => {
                socket.emit("showCanvas");
            }

            let redirect = (url) => {
                socket.emit("redirect", url);
            }
        });
        this.waitForPlayers();



    }

    createUser(socket, arr) {
        this.users[socket.id] = socket;
        this.users[socket.id].clientID = socket.id;
        this.users[socket.id].username = arr[1];
        this.users[socket.id].originID = arr[0];
        this.users[socket.id].character = this.getCharacterSelection(arr[0]);
        console.log(`${socket.username} [id=${socket.id}] added to users.list`);
        this.createPlayer(socket);
    }

    createPlayer(socket) {
        let name = this.users[socket.id].character;
        let char = this.getCharacterStats(name);
        char.id = this.users[socket.id].originID;
        char.sock = socket;
        char.maxActions = this.maxActions;
        char.mapNumber = 0;
        char.entry = [0, 0];
        // adding new Player to players array
        let player = new Player(char);
        this.playerList[socket.id] = player;

    }

    getCharacterStats(name) {
        let ar = [];
        // tries to get json File if exists
        try {
            let json = this.fs.readFileSync("./server/lib/stats_chars.json", "utf8");
            if (json.length < 0) {
                console.log("Error: stats_char.json empty");
            }
            ar = JSON.parse(json);
        } catch (error) {
            throw error;
        }
        return ar.find(x => x.name === name);
    }

    deleteDroppedItemsList() {
        this.fs.writeFile("./server/lib/openedChestsAndDroppedItems.json", "[]", "utf8", (e) => {
            if (e) {
                throw e;
            }
        });
    }

    //////////////
    // TURN FUNCTIONS
    // 
    // fills order array
    createTurn() {
        for (let i in this.playerList) {
            console.log("Im here")
            this.order.push(this.playerList[i]);
        }
        this.shuffleOrder();
        /* for(let i in order){
            roundReset.push(order[i].id);
        } */
        this.roundReset = this.order.slice(0);
        // console.log("tester" + roundReset);

    }
    // randomizes turn order
    shuffleOrder() {
        let curr = this.order.length,
            temp, rnd;
        console.log("Im here2222")
        while (0 !== curr) {
            rnd = Math.floor(Math.random() * curr);
            curr--;

            temp = this.order[curr];
            this.order[curr] = this.order[rnd];
            this.order[rnd] = temp;
        }
    }

    // let the next Players Turn begin
    nextPlayersTurn() {
        this.order.splice(0, 1);
    }

    // starts a new round with the same order as before
    startNewRound() {
        this.this.order = this.roundReset.slice(0);
    }
    //
    // TODO: restart Round 
    // 
    ////////////// 

    // returns startPos on specific map
    findPlayerPosOnMap(mapNumber) {
        for (let i in this.mapData) {
            if (mapNumber == this.mapData[i].mapNumber) {
                return this.mapData[i].entry;
            }
        }
    }

    sendInitToAllClients() {
        let initPackage = [];
        for (let i in this.playerList) {
            let player = this.playerList[i];
            initPackage.push(player.getPlayerData());
        }
        for (let i in this.users) {
            this.users[i].emit("init", initPackage);
        }
    }

}
module.exports = Game;
