class Obstacle {
    constructor(param) {
        this.type = param.type;
        this.x = param.x;
        this.y = param.y;
    }

    getObstacleImg() {
        let img = document.createElement("img");
        img.src = `res/${this.type}.png`;
        return img;
    }

}