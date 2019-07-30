class Player {
    constructor(init, playerNum, squareSize) {
        this.id = init.id;
        this.name = init.name;
        this.x = init.x;
        this.y = init.y;
        this.hp = init.hp;
        this.mp = init.mp;
        this.armor = init.armor;
        this.maxMove = init.maxMove;
        this.race = init.race;
        this.class = init.class;
        this.stepsRemaining = init.maxMove;
        this.bagSize = init.bagSize;
        this.playerNum = playerNum;
        this.inventory = init.inventory;
        this.activeItemSlots = init.activeItemSlots;
        this.inventoryChangedFlag = init.inventoryChangedFlag;
        this.isTurn = init.isTurn;
        this.focused = 0;
        this.attackMode = false;
        this.imgFocused = init.imgFocused;
        this.img = init.img;
        this.dead = init.dead;
        this.deadImg = init.deadImg;
        this.hpChanged = false;
        this.focusedPlayer;
        // Button Events
        // skips available actions
        this.skipBtn = document.getElementById("skipActionBtn");
        this.skipBtn.onclick = () => sock.emit("skipAction");
        // sends data of attack-log to server
        this.attackBtn = document.getElementById("attackBtn");
        this.attackBtn.onclick = () => {
            // checks if attack log is visible
            if ($("#attack-log").is(":visible")) {
                // if so send data to server
                let data = {
                    idOfAttacker: this.id,
                    idOfAttacked: $("#playerToBeAttacked").attr("class"),
                    item: $("#weaponToBeUsed").text(),
                }
                sock.emit("attack", (data));
            } else {
                // if not visible
                // hide all logs
                hideAll();
                // reset all logs
                resetLogs();
                // changes info text to action
                actionBtnText.innerText = "Angriff";
                // show action log
                $(".action-log").show();
                // display info
                if (document.getElementById("info").style.display == "none") {
                    document.getElementById("info").style.display = "block";
                }
                // display attack log
                $("#attack-log").show();
            }

        }
        this.healBtn = document.getElementById("healBtn");
        this.healBtn.onclick = () => {
            // checks if heal log is visible
            if ($("#heal-log").is(":visible")) {
                // if so send data to server
                let data = {
                    idOfHealer: this.id,
                    idOfHealed: $("#playerToBeHealed").attr("class"),
                    item: $("#itemToBeUsed").text(),
                }
                // console.table(data);
                sock.emit("heal", (data));
            } else {
                // if not visible
                // hide all logs
                resetLogs();
                // reset all logs
                // changes info text to action
                actionBtnText.innerText = "Heilen";
                hideAll();
                // show action log
                $(".action-log").show();
                // display info
                if (document.getElementById("info").style.display == "none") {
                    document.getElementById("info").style.display = "block";
                }
                // display heal log
                $("#heal-log").show();
            }
        }
        this.swapBtn = document.getElementById("swapBtn");
        this.swapBtn.onclick = () => {
            // checks if swap log is visible
            if ($("#trade-swap-log").is(":visible")) {
                // if so send data to server
                let data = {

                }
                $(this).data('clicked', false);
            } else {
                // if not visible
                // hide all logs
                resetLogs();
                // changes info text to action
                actionBtnText.innerText = "Tauschen";
                // reset all logs
                hideAll();
                // show action log
                $(".action-log").show();
                // display info
                if (document.getElementById("info").style.display == "none") {
                    document.getElementById("info").style.display = "block";
                }
                // display swap log
                $("#trade-swap-log").show();
                // add clicked as true to differate between swap/trade
                $(this).data('clicked', true);
            }
        }
        this.tradeBtn = document.getElementById("tradeBtn");
        this.tradeBtn.onclick = () => {
            actionBtnText.innerText = "Tauschen";
            if ($("#trade-swap-log").is(":visible")) {
                let data = {

                }
            } else {
                resetLogs();
                hideAll();
                $(".action-log").show();
                if (document.getElementById("info").style.display == "none") {
                    document.getElementById("info").style.display = "block";
                }
                $("#trade-swap-log").show();
            }
        }
        this.dropBtn = document.getElementById("dropBtn");
        this.dropBtn.onclick = () => {
            actionBtnText.innerText = "Fallen lassen";
            if ($("#drop-log").is(":visible")) {
                let data = {

                }
            } else {
                resetLogs();
                hideAll();
                $(".action-log").show();
                if (document.getElementById("info").style.display == "none") {
                    document.getElementById("info").style.display = "block";
                }
                $("#drop-log").show();
            }
        }
        // inventory
        this.invent = Inventory(this.activeItemSlots, this.bagSize, false);

        this.showActiveItemsInPartyFrame();
    }


    setImage() {
        if (this.focused > 0 && !this.dead) {
            // changes pic if player is clicked
            return this.imgFocused;
        } else {
            if (this.dead) {
                // changes pic if player is dead
                return this.deadImg;
            } else {
                return this.img;
            }
        }
    }
    // returns all active item containers
    getActiveItemDivs() {
        let activeItems = document.getElementById("active-items").childNodes;
        let arr = [];
        for (let i in activeItems) {
            if (activeItems[i].className === "item") {
                arr.push(activeItems[i]);
            }
        }
        return arr;
    }

    // shows active Item in Party Frame
    showActiveItemsInPartyFrame() {
        // check if player isn't himself
        if (this.playerNum > 0) {
            let divName = "player-",
                actives = "-actives";
            let partyFrameInventory = document.getElementById(divName + this.playerNum + actives);
            // check if active items exist
            if (this.invent.activeItems.length > 0) {
                invent.createPartyFrameInventory(this.inventory[0], partyFrameInventory, this.playerNum);
            } else {
                if (!partyFrameInventory.hasChildNodes()) {
                    let text = document.createTextNode(this.activeItemSlots);
                    partyFrameInventory.appendChild(text);
                }
            }
        }
    }

    // updates stats of players
    updateStats(init) {
        if (this.playerNum === 0) {
            // displays name, img, race, class
            if (init) {
                document.getElementById("player-stats-name-h3").innerHTML = this.name;
                // document.getElementById("player-stats-char-img").src = this.img;
                document.querySelector('#player-stats-race p').textContent = this.race;
                document.querySelector('#player-stats-class p').textContent = this.class;
                document.querySelector("#player-stats-bag p").textContent = this.bagSize;
            }
            document.querySelector("#player-stats-hp p").textContent = this.hp;
            document.querySelector("#player-stats-mana p").textContent = this.mp;
            document.querySelector("#player-stats-move p").textContent = this.stepsRemaining;
            document.querySelector("#player-stats-actions p").textContent = this.actions;

        } else {
            let player = "#player-",
                name = "-name",
                hp = "-hp",
                mp = "-mp",
                moves = "-moves",
                actives = "-actives";
            let elementId = "party-player-" + this.playerNum;
            if (init) {
                let tdx = document.getElementById(elementId);
                tdx.className = "" + this.id;
                // displays party-player frame
                tdx.style.display = "block";
                // displays name, img, race, class
                document.querySelector(player + this.playerNum + name).innerHTML = this.name;
                // adds Listener for targeting players
                $("#" + elementId).focusin(() => {
                    this.focused = 1;
                    this.focusedPlayer = this.id;
                    addToLog();
                })
                // adds Listener for untargeting players
                $("#" + elementId).focusout(() => {
                    this.focused = 0;
                })

                // document.getElementById("player-stats-char-img").src = this.img;
            }
            document.querySelector(player + this.playerNum + hp).textContent = this.hp;
            document.querySelector(player + this.playerNum + mp).textContent = this.mp;
            document.querySelector(player + this.playerNum + moves).textContent = this.stepsRemaining;
            showActiveItemsInPartyFrame();
        }
    }

    // adds focused player to log
    addToLog() {
        if ($("#attack-log").is(":visible")) {
            document.getElementById("playerToBeAttacked").innerText = this.name;
            document.getElementById("playerToBeAttacked").className = this.id;
        }
        if ($("#heal-log").is(":visible")) {
            document.getElementById("playerToBeHealed").innerText = this.name;
            document.getElementById("playerToBeHealed").className = this.id;
        } else {
            playerToBeHealed.innerText = this.name;
            playerToBeHealed.className = this.id;

        }
        if ($("#trade-swap-log").is(":visible")) {
            if ($("#swapBtn").data('clicked') == false) {
                document.getElementById("itemOrPlayerForTrade").innerText = this.name;
                document.getElementById("itemOrPlayerForTrade").className = this.id;
            }
        }
    }


    resetLogs() {
        playerToBeAttacked.innerText = "Spieler";
        weaponToBeUsed.innerText = "deinen Händen";
        playerToBeHealed.innerText = "dich selbst";
        playerToBeHealed.className = this.id;
        itemToBeUsed.innerText = "deinen Gedanken";
        itemForTrade.innerText = "Luft";
        itemOrPlayerForTrade.innerText = "niemandem";
        actionBtnText.innerText = "";
    }
    hideAll() {
        $("#action-log").hide();
        $("#attack-log").hide();
        $("#heal-log").hide();
        $("#trade-swap-log").hide();
        $("#drop-log").hide();
    }
}