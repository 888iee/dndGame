class Game {
    constructor(io) {
        this.fs = require("fs");
        this.mapData = require("../../lib/map");

        require("../../../client/js/Inventory");

        // //
        this.Player = require("./Player");

        // connnected users list
        this.users = {};
        // connected players list
        Player.list = {};

        // //
        // limit for maxPlayers
        this.maxPlayers = 2;
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
    }
    preloader() {
        preLoadLoop = setInterval(() => {
            console.log("didn't start yet")
            let size = Object.objsize(Player.list);
            if (size === maxPlayers && loadMapTrigger) {
                sendInitToAllClients();
                createTurn();
                size++;
                loadMapTrigger = false;
                gameReady = true;
            }
        }, 2000);
    }
    launch() {
        preloader();
        if (gameReady) {
            clearInterval(preLoadLoop());
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
                        startNewRound();
                    } else {
                        // checks if it's the players turn
                        if (player == order[0]) {
                            if (player.dead) {
                                nextPlayersTurn();
                            } else {
                                // checks if players max Actions reached
                                if (player.isItMyTurn(maxActions)) {

                                } else {
                                    // if player reached max Actions 
                                    // reset moves
                                    player.resetPlayer();
                                    // let the next players turn begin
                                    nextPlayersTurn();
                                }
                            }
                        }
                    }
                    player.updateStats();
                }
                let package = Player.update();
                for (let i in users) {
                    // users[i].emit("newPos", (package));
                    users[i].emit("update", package);
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
    findPlayerPosOnMap = (mapNumber) => {
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