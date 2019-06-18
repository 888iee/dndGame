class MapGen {
    constructor(data, cols, rows, squareSize) {
        this.mapNumber = data.mapNumber;
        this.outside = data.outside;

        this.canvas = document.getElementById("cnvs");
        this.ctx = canvas.getContext("2d");

        /*     this.rows = rows;
            this.cols = cols; */

        this.chestCounter = 0;
        this.chests = [];

        /* if true sets background to grass else to stone */
        this.outside = data.outside;

        /* array of trees, stones and chests */
        this.obstacles = data.obstacles;

        /* start and exit of room  */
        this.entry = data.entry;
        this.exit = data.exit;

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
                ctx.drawImage(obstac.getObstacleImg(), obstac.x * squareSize, obstac.y * squareSize, squareSize, squareSize);
            } else {
                let chest = new Chest(this.obstacles[i]);
                ctx.drawImage(chest.getChestImg(), chest.x * squareSize, chest.y * squareSize, squareSize, squareSize);
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
        ctx.drawImage(startIMG, this.entry[0] * squareSize, this.entry[1] * squareSize, squareSize, squareSize);
        let doorIMG = new Image();
        doorIMG.src = "res/door.png";
        ctx.drawImage(doorIMG, this.exit[0] * squareSize, this.exit[1] * squareSize, squareSize, squareSize);
    }

    openDoor() {
        // console.log("You open the door!");
        mapCounter++;
        swapRoom = true;
        loadRoom();
    }

    /* creates every object in the room */
    generateRoom(bool) {
        drawBoard();
        showBackground();
        getStartEnd();
        generateObstacles(bool);
    }

    drawBoard() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * squareSize;
                let y = j * squareSize;

                ctx.strokeRect(x, y, squareSize, squareSize);
                // ctx.strokeRect(squareSize, y, squareSize, squareSize);
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

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * squareSize;
                let y = j * squareSize;

                ctx.drawImage(background, x, y, squareSize - 0.5, squareSize - 0.8);
            }
        }
    }

}