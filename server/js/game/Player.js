const Inventory = require("../../../client/js/Inventory");
const Physics = require("./Physics");
const Interact = require("./Interact");

class Player {
    constructor(stats) {
        this.id = stats.id;
        this.sock = stats.sock;
        this.x = stats.entry[0];
        this.y = stats.entry[1];
        this.maxActions = stats.maxActions;

        this.name = stats.name;
        this.race = stats.race;
        this.class = stats.class;
        this.isOnMap = stats.mapNumber;
        this.lvl = stats.lvl;
        this.maxMove = stats.maxMove;
        this.stepsRemaining = stats.maxMove;
        this.moveCounter = 0;
        this.bagSize = stats.bagSize;
        this.activeItemSlots = stats.activeItemSlots;
        this.activeSlots = stats.activeSlots;
        this.maxHp = stats.maxHp;
        this.hp = stats.hp;
        this.maxMana = stats.maxMana;
        this.mp = stats.mana;
        this.armor = stats.armor;
        this.lvl2 = stats.lvl2;
        this.lvl3 = stats.lvl3;
        this.actions = 0;
        this.imgFocused = stats.imgFocused;
        this.img = stats.img;
        this.deadImg = stats.deadImg;
        this.dead = false;

        this.isTurn = false;
        this.pressRight = false;
        this.pressLeft = false;
        this.pressUp = false;
        this.pressDown = false;
        this.hpChanged = false;
        this.inventory = new Inventory(this.activeItemSlots, this.bagSize, true, this.sock);

        this.interact = new Interact(this);

        // Player.list[this.id] = self;

        // receives attack command from client
        this.sock.on("attack", (data) => {
            if (this.canIAct() && this.canIAbortMovementAndDoAnotherAction()) {
                console.log(this.id + " can act and move");
                if (this.actions <= this.maxActions - 1) {
                    console.log(data.idOfAttacker + " wants to attack " + data.idOfAttacked + " with " + data.item + ".");
                    // checks if item exist
                    if (data.item === "deinen Händen") {
                        // if not attack with bare hands
                        if (interact.attack(Player.list[data.idOfAttacked])) {
                            this.abortMovement();
                        }
                        // Interact(self, Player.list[data.idOfAttacked], "attack");
                    } else {
                        if (interact.attack(Player.list[data.idOfAttacked], this.inventory.getItem(data.item))) {
                            this.abortMovement();
                        }
                        // Interact(self, Player.list[data.idOfAttacked], this.inventory.getItem(data.item));
                    }
                }
            }
        });


        // receives heal command from client
        this.sock.on("heal", (data) => {
            if (this.canIAct()) {
                this.canIAbortMovementAndDoAnotherAction();
                let healed;
                // checks who should be healed
                if (data.idOfHealed == this.id || data.idOfHealed == []._) {
                    healed = self;
                } else {
                    healed = Player.list[data.idOfHealed];
                }
                console.log(data.idOfHealer + " wants to heal " + healed + " with " + data.item + ".");
                if (data.item === "deinen Gedanken") {
                    interact.heal(healed);
                    // Interact(self, healed, "heal");
                } else {
                    interact.heal(healed, this.inventory.getItem(data.item));
                    // Interact(self, healed, "heal", this.inventory.getItem(data.item));
                }
            }
        });
        // listens to clients skipActionBtn
        this.sock.on("skipAction", () => {
            this.skipAction();
            this.log();
        });
        // sends player data to its client
        this.sock.emit("getPlayer", this.getPlayerData());
    }

    // setInventory() {
    //     let inv =
    //         return inv;
    // }

    // returns true if actions left
    canIAct() {
        if (this.isTurn && this.actions < this.maxActions) {
            return true;
        }
    }

    // checks if self already started moving
    // if so set steps to zero && actions+1
    canIAbortMovementAndDoAnotherAction() {
        if (this.stepsRemaining !== this.maxMove && this.moveCounter > 0) {
            console.log("canIAbortMovementAndDoAnotherAction\ncan't act cause " + this.id + "already started movement.");
            return false;
        } else {
            console.log("canIAbortMovementAndDoAnotherAction\n" + this.id + " can move.");
            return true;
        }
    }
    abortMovement() {
        if (this.stepsRemaining !== this.maxMove && this.stepsRemaining !== 0) {
            this.stepsRemaining = 0;
            this.actions++;
            console.log(this.id + " aborted movement = actions++");
        }

    }

    // validates Key Presses from Client
    validateUserInput(data) {
        // continues if Player can interact
        if (this.isTurn) {
            let physics = Physics(self, data);
            // checks for data.actionType
            if (data.actionType === "move") {
                // checks if move is possible
                if (physics.controlMove()) {
                    // moves player
                    this.move(data);
                }
            } else if (data.actionType === "open") {
                // returns chest if opened
                this.openChest(physics.getChests());

            }
        }
    }
    // updates Player Position
    updateStats() {
        if (this.pressUp) {
            this.y--;
            this.pressUp = false;
        } else if (this.pressDown) {
            this.y += 1;
            this.pressDown = false;
        } else if (this.pressRight) {
            this.x += 1;
            this.pressRight = false;
        } else if (this.pressLeft) {
            this.x -= 1;
            this.pressLeft = false;
        }
        this.hpChanged = false;
    }

    // moves Player
    move(data) {
        if (this.canIAct()) {
            // checks if steps are left && if u walked once
            if (this.stepsRemaining > 0 && this.moveCounter <= 1) {
                if (data.inputId === "right") {
                    this.pressRight = data.state;
                    this.stepsRemaining--;
                } else if (data.inputId === "left") {
                    this.pressLeft = data.state;
                    this.stepsRemaining--;
                } else if (data.inputId === "up") {
                    this.pressUp = data.state;
                    this.stepsRemaining--;
                } else if (data.inputId === "down") {
                    this.pressDown = data.state;
                    this.stepsRemaining--;
                }
            }
            // check if steps = 0
            if (this.stepsRemaining == 0) {
                // if so moveCounter+1
                this.moveCounter++;
                // check if moveCounter>1
                // reset steps && actions+1
                if (this.moveCounter <= 1) {
                    this.stepsRemaining = this.maxMove;
                    this.actions++;
                } else {
                    this.actions++;
                }
            }
        }
        this.log();
    }

    // print player details
    log() {
        console.log(this.id + ", steps left: " + this.stepsRemaining +
            ", max steps: " + this.maxMove + ", actions done: " + this.actions + ", moveCounter: " + this.moveCounter);
    }

    logStats() {
        console.log(this.id + " has " + this.hp + " and " + this.mp + ".");
    }

    // resets Player Round stats
    resetPlayer() {
        this.stepsRemaining = this.maxMove;
        this.actions = 0;
        this.moveCounter = 0;
        this.isTurn = false;
    }

    // adds 1 to actions and deletes remaining Steps
    didAction() {
        this.deleteRemainingSteps();
    }

    // returns true if actions is below maxActions
    areActionsLeft() {
        if (this.actions < this.maxActions) {
            return true;
        }
    }

    // deletes Remaining Steps
    deleteRemainingSteps() {
        if (this.stepsRemaining != this.maxMove) {
            this.skipAction()
            this.stepsRemaining = 0;
        }
    }

    // skips Round
    skipAction() {
        this.actions++;
    }



    // returns true if it is still players turn
    isItMyTurn() {
        let bool = areActionsLeft(this.maxActions);
        this.sock.emit("myTurn", bool)
        return this.isTurn = bool;
    }

    // opens Chest if possible
    openChest(chests) {
        if (this.actions > 1 && this.stepsRemaining <= this.maxMove) {
            console.log(this.id + " can't do more actions.")
        } else {
            for (let i = 0; i < chests.length; i++) {
                if (((this.x + 1 == chests[i].x && this.y == chests[i].y) ||
                        (this.x - 1 == chests[i].x && this.y == chests[i].y) ||
                        (this.y - 1 == chests[i].y && this.x == chests[i].x) ||
                        (this.y + 1 == chests[i].y && this.x == chests[i].x) ||
                        (this.x == chests[i].x && this.y == chests[i].y))) {
                    if (loot(chests[i]) == true) {
                        this.log();
                    }
                }
            }
        }
    }

    // returns item from chest to inventory
    loot(chest) {
        // console.log(droppedItems);
        if (chest.opened) {
            console.log("Chest is already opened");
        } else {
            if (this.inventory.isInventoryFull() === false) {

                item = chest.getLoot();
                if (typeof item === "undefined") {
                    return false;
                }
                console.log("looting " + item.name);
                this.didAction();
                this.skipAction();
                this.inventory.addItem(item);
                return true;
            }
            return false;
        }
    }

    // applies damage to player
    setDamage(dmg) {
        let trueDmg = dmg - this.armor;
        if (trueDmg > 0) {
            this.hpChanged = true;
            this.hp = this.hp - trueDmg;
        }
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }

    // applies health to player
    setHeal(heal) {
        this.hpChanged = true;
        this.hp = this.hp + heal;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    // returns melee or ranged
    getDistance(enemy) {
        if (((this.x + 1 == enemy.x && this.y == enemy.y) ||
                (this.x - 1 == enemy.x && this.y == enemy.y) ||
                (this.y - 1 == enemy.y && this.x == enemy.x) ||
                (this.y + 1 == enemy.y && this.x == enemy.x) ||
                (this.x == enemy.x && this.y == enemy.y))) {
            return "melee";
        } else {
            return "ranged";
        }
    }


    getPlayerData() {
        let data = {
            name: this.name,
            race: this.race,
            class: this.class,
            id: this.id,
            x: this.x,
            y: this.y,
            actions: this.actions,
            stepsRemaining: this.stepsRemaining,
            bagSize: this.bagSize,
            activeItemSlots: this.activeItemSlots,
            hp: this.hp,
            mp: this.mp,
            armor: this.armor,
            isTurn: this.isTurn,
            dead: this.dead,
            imgFocused: this.imgFocused,
            img: this.img,
            deadImg: this.deadImg,
            hpChanged: false,
        }
        if (this.inventory.getChangedFlag()) {
            data.inventory = this.inventory.getInventory();
        }
        return data;
    }



}


module.exports = Player;