class Chest {
    constructor(param, status) {
        this.id = param.id;
        this.x = param.x;
        this.y = param.y;
        this.opened = status;
        this.fs = require("fs");
        require("../../../../client/js/Item");
    }


    // returns Item from self.itemPool
    getLoot() {

        let itemPool = dropDroppedItems();
        if (itemPool.length !== 0) {
            random = Math.floor(Math.random() * itemPool.length);

            let item = itemPool[random];
            this.opened = true;
            saveChestToFile(item.name);
            return item;
        }

        console.log("No more items to loot!");

    }

    // returns an array filled with all opened chest objects
    saveChestToFile(name) {
        let ar = [];
        // tries to get json File if exists
        try {
            let json = fs.readFileSync("./server/lib/openedChestsAndDroppedItems.json", "utf8");
            if (json.length > 0) {
                ar = JSON.parse(json);
            }
        } catch (error) {
            throw error;
        }
        let data = {
            id: this.id,
            x: this.x,
            y: this.y,
            opened: this.status,
            itemName: name
        }
        ar.push(data);
        // beautifies json data
        let json = JSON.stringify(ar, null, 4);
        saveChestData(json);
    }

    // saves chest objects to File
    saveChestData(data) {
        fs.writeFile("./server/lib/openedChestsAndDroppedItems.json", data, "utf8", (e) => {
            if (e) throw e;
            console.log("added chest to opened list.");
        });
    }

    // drops already looted Items out of Pool
    dropDroppedItems() {
        // loads all dropped Item list
        let json = fs.readFileSync("./server/lib/openedChestsAndDroppedItems.json", {
            encoding: "utf8"
        });
        let looted = JSON.parse(json);
        // loads all Item list
        let itemPool = JSON.parse(fs.readFileSync("./server/lib/lvl1_items.json", {
            encoding: "utf8"
        }));

        for (let i in looted) {
            let name = looted[i].itemName;

            for (let j in itemPool) {
                if (itemPool[j].name === name) {
                    itemPool.splice(j, 1);
                }
            }
        }

        return itemPool;
    }

}
module.exports = Chest;