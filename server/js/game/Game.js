"use strict";
class Game {
    constructor(io, room) {
        this.fs = require("fs");
        this.mapData = require("../../lib/map");

        require("../../../client/js/Inventory");

        // //
        this.Player = require("./Player");

        // connnected users list
        this.users = {};
        // connected players list
        this.Player.list = {};

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
        this.gameReady = false;

        // TODO: create Phases for looting, battle, etc
        // TODO: 
        this.preLoadLoop;
        this.io = io;
        this.room = room;

    }
    preloader() {
        let preLoadLoop = setInterval(() => {
            console.log("didn't start yet")
            let size = Object.objsize(this.Player.list);
            if (size === this.maxPlayers && lthis.oadMapTrigger) {
                this.sendInitToAllClients();
                this.createTurn();
                size++;
                this.this.loadMapTrigger = false;
                this.gameReady = true;
            }
        }, 2000);
    }
    waitForPlayers() {
        this.io.on("connection", socket => {
            socket.on("authenticate", (data) => {
                socket.emit("getList", getRoomList());
                let arr = splitPassedCookiesData(data);
                users[socket] = socket;
                users[socket].clientID = socket.id;
                users[socket].username = arr[1];
                users[socket].originID = arr[0];
                console.log(`${socket.username} [id=${socket.id}] has been authenticated`);
            });
        });

    }
    launch() {
        this.waitForPlayers();

        this.preloader();
        if (this.gameReady) {
            clearInterval(this.preLoadLoop());
            // clearTimeout(preLoadLoop)
            // GAME LOOP
            // TODO: need game loop
            setInterval(function () {
                // iterates through all players
                for (let i in Player.list) {
                    let player = Player.list[i];
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
                }
                pack = Player.update();
                for (let i in users) {
                    // users[i].emit("newPos", (package));
                    users[i].emit("update", pack);
                    // user.emit("remove", removePackage);
                }
            }, 1000 / 80);
        }
    }


    deleteDroppedItemsList() {
        fs.writeFile("./server/lib/openedChestsAndDroppedItems.json", "[]", "utf8", (e) => {
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
        for (let i in Player.list) {
            order.push(Player.list[i]);
        }
        shuffleOrder();
        /* for(let i in order){
            roundReset.push(order[i].id);
        } */
        roundReset = order.slice(0);
        // console.log("tester" + roundReset);

    }
    // randomizes turn order
    // TODO: shuffle player order randomly
    shuffleOrder() {
        let curr = order.length,
            temp, rnd;
        while (0 !== curr) {
            rnd = Math.floor(Math.random() * curr);
            curr--;

            temp = order[curr];
            order[curr] = order[rnd];
            order[rnd] = temp;
        }
    }

    // let the next Players Turn begin
    // TODO: let next players turn begin
    nextPlayersTurn() {
        order.splice(0, 1);
    }

    // TODO: start new Round
    // starts a new round with the same order as before
    startNewRound() {
        order = roundReset.slice(0);
    }
    //
    // TODO: restart Round 
    // 
    ////////////// 

    // returns startPos on specific map
    findPlayerPosOnMap(mapNumber) {
        for (let i in mapData) {
            if (mapNumber == mapData[i].mapNumber) {
                return mapData[i].entry;
            }
        }
    }

    sendInitToAllClients() {
        let initPackage = [];
        for (let i in Player.list) {
            let player = Player.list[i];
            initPackage.push(player.getPlayerData());
        }
        for (let i in users) {
            users[i].emit("init", initPackage);
        }
    }

}
module.exports = Game;
// returns size of object
// !!ERROR?
Object.objsize = function (Myobj) {
    var osize = 0,
        key;
    for (key in Myobj) {
        if (Myobj.hasOwnProperty(key)) osize++;
    }
    return osize;
};