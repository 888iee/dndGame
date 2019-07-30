class MapGen {
    constructor(data, cols, rows, squareSize) {
        this.mapNumber = data.mapNumber;
        this.outside = data.outside;

        this.canvas = document.getElementById("cnvs");
        this.ctx = this.canvas.getContext("2d");

        this.chestCounter = 0;
        this.chests = [];

        /* if true sets background to grass else to stone */
        this.outside = data.outside;

        /* array of trees, stones and chests */
        this.obstacles = data.obstacles;

        /* start and exit of room  */
        this.entry = data.entry;
        this.exit = data.exit;

        this.cols = cols;
        this.rows = rows;
        this.squareSize = squareSize;
    }

    getNumber() {
        return this.mapNumber;
    }

    checkIfChestIsOpened(chest) {
        return chest.opened;
    }

    generateObstacles(bool) {
        // iterate through obstacles array
        for (let i in this.obstacles) {
            // check if object.type is "chest"
            if (this.obstacles[i].type !== "chest") {
                // if not 
                let obstac = new Obstacle(this.obstacles[i]);
                this.ctx.drawImage(obstac.getObstacleImg(), obstac.x * this.squareSize, obstac.y * this.squareSize, this.squareSize, this.squareSize);
            } else {
                let chest = new Chest(this.obstacles[i]);
                this.ctx.drawImage(chest.getChestImg(), chest.x * this.squareSize, chest.y * this.squareSize, this.squareSize, this.squareSize);
            }
        }
    }



    // returns chests to Player
    getChests() {
        return chests;
    }

    /* creates Start and Exit */
    getStartEnd() {
        let startIMG = new Image();
        startIMG.src = "res/start.png";
        this.ctx.drawImage(startIMG, this.entry[0] * this.squareSize, this.entry[1] * this.squareSize, this.squareSize, this.squareSize);
        let doorIMG = new Image();
        doorIMG.src = "res/door.png";
        this.ctx.drawImage(doorIMG, this.exit[0] * this.squareSize, this.exit[1] * this.squareSize, this.squareSize, this.squareSize);
    }

    openDoor() {
        // console.log("You open the door!");
        this.mapCounter++;
        this.swapRoom = true;
        this.loadRoom();
    }

    /* creates every object in the room */
    generateRoom(bool) {
        this.drawBoard();
        this.showBackground();
        this.getStartEnd();
        this.generateObstacles(bool);
    }

    drawBoard() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let x = i * this.squareSize;
                let y = j * this.squareSize;

                this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
                // ctx.strokeRect(squareSize, y, this.squareSize, this.squareSize);
            }
        }

    }
    // shows background
    showBackground() {
        let background = new Image();
        if (this.outside == false) {
            background.src = "res/ground.png";
        } else {
            background.src = "res/grass.png";
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let x = i * this.squareSize;
                let y = j * this.squareSize;

                this.ctx.drawImage(background, x, y, this.squareSize - 0.5, this.squareSize - 0.8);
            }
        }
    }

}