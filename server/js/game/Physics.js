class Physics {
    constructor(player, data) {
        this.Chest = require("./Chest");
        this.self = {
            x: player.x,
            y: player.y,
        }
        this.data = data;


        this.mapData();
    }
    mapData() {
        let fs = require("fs");
        let mapJSON = fs.readFileSync("./server/lib/map.json", {
            encoding: "utf8"
        });
        let map = JSON.parse(mapJSON);
        this.obstacles = map[player.isOnMap].obstacles;
        this.exit = map[player.isOnMap].exit;
    }
    // gets Coordinates
    getControls() {
        this.coords = this.getCoords(data);
        this.distance = this.coords.distance;
        this.axis = this.coords.axis;

    }
    // passes Coords to runVsObjects()
    controlMove() {
        this.getControls();
        return this.runVsObjects();
    }

    // returns true if chest is opened
    isChestOpened(chestId) {
        let fs = require("fs");
        let json = fs.readFileSync("./server/lib/openedChestsAndDroppedItems.json", {
            encoding: "utf8"
        });
        let droppedItems = JSON.parse(json);

        for (let j in droppedItems) {
            if (droppedItems[j].id === chestId) {
                return true;
            }
        }
        return false;
    }
    // returns chests of map
    getChests() {
        let chests = [];
        for (let i in this.obstacles) {
            if (this.obstacles[i].type == "chest") {
                this.addToList(this.obstacles[i], isChestOpened(this.obstacles[i].id), chests);
            }
        }
        return chests;
    }

    // makes chest array to Chest()
    addToList(chest, status, chests) {
        return chests.push(
            Chest(chest, status));
    }

    // determines if player runs against objects
    runVsObjects() {
        if (this.axis === "x") {
            for (let i in this.obstacles) {
                if (this.x + this.distance == this.obstacles[i].x) {
                    if (this.y == this.obstacles[i].y) {
                        return false;
                    }
                }
            }
        } else if (this.axis === "y") {
            for (let i in this.obstacles) {
                if (this.x == this.obstacles[i].x) {
                    if (this.y + this.distance == this.obstacles[i].y) {
                        return false;
                    }
                }
            }
        }
        return this.borderControl();
    }
    // keeps player inside the map
    borderControl() {
        let destY = this.y + this.distance;
        let destX = this.x + this.distance;
        if (this.axis === "x") {
            if (destX < 0 || destX > 14) {
                return false;
            }
        } else if (this.axis === "y") {
            if (destY < 0 || destY > 14) {
                return false;
            }
        }
        return true;
    }

    // helper Function to determine axis and direction
    getCoords(data) {
        switch (data.inputId) {
            case "right":
                return {
                    distance: 1,
                        axis: "x"
                }
                case "left":
                    return {
                        distance: -1,
                            axis: "x"
                    }
                    case "up":
                        return {
                            distance: -1,
                                axis: "y"
                        }
                        case "down":
                            return {
                                distance: 1,
                                    axis: "y"
                            }
        }

    }


}

module.exports = Physics;