class Chest {
    constructor(param) {
        this.x = param.x;
        this.y = param.y;
        this.id = param.id;
        this.opened = false;

    }


    getChestImg() {
        let img = new Image();
        if (this.opened) {
            img.set = "res/chest.png";
        } else {
            img.set = "res/chestOpened.png";
        }
        return img;
    }
}