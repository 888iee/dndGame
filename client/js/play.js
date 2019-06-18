let squareSize = 60;
const rows = 15;
const cols = 15;

let map;
let sock = io();
let myID;
let inventory;
let gameReady = false;
let focused;
let stop = false;
let save = [];

sock.on("getPlayer", (data) => {
    // assigns clients player id to myID
    myID = data.id;
    console.table(data);
    inventory = Inventory(data.activeItemSlots, data.bagSize, false, sock);
    inventory.createInventory();
});
// updates Client's inventory
sock.on("updateInventory", (data) => {
    inventory.activeItems = data[0];
    inventory.bag = data[1];
    inventory.showInventory();
})

sock.on("debug", (data) => {
    console.log(data);
})
let startGame = function () {
    sock.emit("startGame");
}
$("#startBtn").click(() => startGame());
// receives load map to server
sock.on("loadMap", (mapNumber) => {
    $.ajax({
            type: "GET",
            url: "http://localhost:5000/map",
            dataType: "json",
            success: (data) => {
                // console.log(data);
                for (let i = 0; i < data.length; i++) {
                    if (mapNumber == data[i].mapNumber) {
                        loadMap(data[mapNumber]);
                    }
                }
            }
        })
        .fail((jqXHR, textStatus) => {
            console.log("AJAX ERROR: ", textStatus);
        });
});

// enables Buttons if Client's turn
sock.on("myTurn", (data) => {
    let skipBtn = document.getElementById("skipActionBtn");
    let healBtn = document.getElementById("healBtn");
    let swapBtn = document.getElementById("swapBtn");
    let tradeBtn = document.getElementById("tradeBtn");
    let dropBtn = document.getElementById("dropBtn");
    if (data) {
        skipBtn.disabled = false;
        attackBtn.disabled = false;
        healBtn.disabled = false;
        swapBtn.disabled = false;
        tradeBtn.disabled = false;
        dropBtn.disabled = false;
    } else {
        skipBtn.disabled = true;
        attackBtn.disabled = true;
        healBtn.disabled = true;
        swapBtn.disabled = true;
        tradeBtn.disabled = true;
        dropBtn.disabled = true;
    }
});

// receives canvas
sock.on("showCanvas", () => {
    let canvas = document.getElementById("cnvs");
    canvas.style.display = "block";

    let startBtn = document.getElementById("startGame");
    startBtn.style.display = "none";

    let playerStats = document.getElementById("player");
    playerStats.style.display = "inline-block";
    $(".action-buttons").show();
    let nodes = $(".action-buttons").children();
    for (let i in nodes) {
        $("#" + nodes[i].id).attr("disabled", true);
        $("#" + nodes[i].id).on("mousedown", (e) => e.preventDefault());
    }
});

// List of Players
let playerList = {};
sock.on("package", (data) => console.log(data));

// initialize players
sock.on("init", (players) => {
    let playerNum = 1;
    for (let i in players) {
        if (players[i].id === myID) {
            playerList[players[i].id] = new Player(players[i], 0, squareSize);
            playerList[players[i].id].updateStats(true);
        } else {
            playerList[players[i].id] = new Player(players[i], playerNum, squareSize);
            playerList[players[i].id].updateStats(true);
            playerNum++;
        }
    }
    document.querySelector(".party").style.display = "block";
});

// updates players
sock.on("update", (players) => {
    for (let i in players) {
        let updatedPlayer = players[i];
        let playId = playerList[updatedPlayer.id];
        if (playId) {
            playId.x = updatedPlayer.x;
            playId.y = updatedPlayer.y;
            playId.actions = updatedPlayer.actions;
            playId.armor = updatedPlayer.armor;
            playId.hp = updatedPlayer.hp;
            playId.mp = updatedPlayer.mp;
            playId.stepsRemaining = updatedPlayer.stepsRemaining;
            playId.dead = updatedPlayer.dead;
            if (updatedPlayer.inventory !== []._) {
                playId.inventory = updatedPlayer.inventory;
            }
            playId.updateStats();
            // playId.inventoryChangedFlag = 0;
        }
    }
});
// removes Player from List
sock.on("remove", (data) => {
    for (let i in data.length) {
        delete playerList[data[i]];
    }
});

// draws ranged attack traces
sock.on("draw", (data) => {
    // console.log("hallo")
    // stop = true;
    save.push(data);

});

// GAME LOOP CLIENT SIDE
setInterval(() => {
    if (typeof map == "undefined") {} else {

        map.generateRoom(squareSize, false);
        let ctx = document.getElementById("cnvs").getContext("2d");
        for (let i in playerList) {
            let playerImg = new Image();
            playerImg.src = playerList[i].setImage();
            ctx.drawImage(playerImg, playerList[i].x * squareSize, playerList[i].y * squareSize, squareSize, squareSize);
            playerList[i].updateStats();
        }
    }
    for (let i in save) {
        var c = document.getElementById("cnvs");
        var ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(save[i].px * squareSize, save[i].py * squareSize);
        ctx.lineTo(save[i].ex * squareSize, save[i].ey * squareSize);
        ctx.stroke();
    }
    // when turn ends hide log
    if (document.getElementById("attackBtn").disabled == true) {
        document.getElementById("attack-log").style.display = "none";
        document.getElementById("weaponToBeUsed").innerText = "deinen Händen";
        document.getElementById("playerToBeAttacked").innerText = "Spieler";
        $('.action-log').css('display', 'none');
    } else if (document.getElementById("healBtn").disabled == true) {
        document.getElementById("heal-log").style.display = "none";
        document.getElementById("itemToBeUsed").innerText = "deinen Gedanken";
        document.getElementById("playerToBeHealed").innerText = "dich Selbst";
        $('.action-log').css('display', 'none');
    }
}, 1000 / 80);

sock.on("log", (data) => console.log(data));

// sends keycodes to server if client's turn
document.onkeydown = (event) => {
    // console.log("Key pressed");
    if (event.keyCode === 68) { //d
        sock.emit("keyPress", {
            inputId: "right",
            state: true,
            actionType: "move"
        });
    } else if (event.keyCode === 83) { //s
        sock.emit("keyPress", {
            inputId: "down",
            state: true,
            actionType: "move"
        });
    } else if (event.keyCode === 65) { //a
        sock.emit("keyPress", {
            inputId: "left",
            state: true,
            actionType: "move"
        });
    } else if (event.keyCode === 87) { //w
        sock.emit("keyPress", {
            inputId: "up",
            state: true,
            actionType: "move"
        });
    } else if (event.keyCode === 69) { //e
        sock.emit("keyPress", {
            inputId: "open",
            state: true,
            actionType: "open"
        });
    }
}

// loads specific map
let loadMap = (data) => {
    // console.log(data);
    map = new MapGen(data, cols, rows, squareSize);
    map.generateRoom(false);
}