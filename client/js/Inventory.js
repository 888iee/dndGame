class Inventory {
    constructor(activeItemSlots, bagSize, onServer, socket) {
        this.activeItems = [];
        this.activeItemSize = activeItemSlots;
        this.bag = [];
        this.bagSize = bagSize;
        this.onServer = onServer;
        this.socket = socket;
        this.changedFlag = 0;
        this.clientSideItemManager = [];
        this.focusedItem;
    }
    // creates Inventory UI
    createInventory() {
        let itemCount = 0;
        let inventory = this.getInventory();
        for (let i = 0; i < inventory.length; i++) {
            let inventoryDiv;
            if (i === 0) {
                inventoryDiv = document.getElementById("active-items");
                itemCount = this.createSlots(this.activeItemSize, itemCount, inventoryDiv, true);
            } else {
                inventoryDiv = document.getElementById("bag-items");
                itemCount = this.createSlots(this.bagSize, itemCount, inventoryDiv, false);
            }
        }
        this.createItems(this.getInventory());
    }

    // creates Slots for each Bag
    createSlots(slots, itemCount, inventoryDiv, activeOrBag) {
        for (let j = 0; j < slots; j++) {
            let itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.tabIndex = -1;
            itemDiv.setAttribute("id", itemCount);

            inventoryDiv.appendChild(itemDiv);
            itemCount++;
        }
        return itemCount;
    }

    // returns item at Position xy
    isItemActive(item) {
        for (let i in this.activeItems) {
            if (this.activeItems[i] == item) {
                return true;
            }
        }
        return false;
    }

    // creates Item at Slot 
    createItems(inventory) {
        let itemID = 0;
        for (let i = 0; i < inventory.length; i++) {
            if (i === 0) {
                for (let j = 0; j < this.activeItemSize; j++) {
                    this.createItemUI(inventory[i][j], itemID);
                    itemID++;
                }
            } else {
                for (let j = 0; j < this.bagSize; j++) {
                    this.createItemUI(inventory[i][j], itemID);
                    itemID++;
                }
            }
        }
    }

    createPartyFrameInventory(inventory, elementToAppend, playerNum) {
        let itemID = "player-" + playerNum + "-actives-item-";
        while (elementToAppend.firstChild) {
            elementToAppend.removeChild(elementToAppend.firstChild);
        }
        for (let i in inventory) {
            let partyFrameItemSlot = document.createElement("div");
            partyFrameItemSlot.id = itemID + i;
            partyFrameItemSlot.style.height = "30px";
            partyFrameItemSlot.style.width = "30px";
            partyFrameItemSlot.style.overflow = "hidden";
            partyFrameItemSlot.style.border = "2px solid #8b0000";
            partyFrameItemSlot.style.borderRadius = "10px";
            partyFrameItemSlot.style.float = "left";
            partyFrameItemSlot.style.backgroundSize = "30px 30px";


            elementToAppend.appendChild(partyFrameItemSlot);
            createItemUI(inventory[i], itemID + i, true);
        }
    }

    createItemUI(item, itemID, partFrame) {
        // array of items = all divs where class is item
        // let items = document.getElementsByClassName("item");

        if (typeof item !== "undefined") {
            // creates Div where Image and object will be saved
            let itemSlot = document.createElement("div");

            itemSlot.id = item.name;
            let id;
            // id of div
            if (partFrame) {
                // if function was called from createPartyFrameInventory
                id = itemID;
            } else {
                id = document.getElementsByClassName("item")[itemID].id;
            }
            let itemPos = document.getElementById(id);
            // save item in client array
            this.clientSideItemManager[id] = item;



            // don't create focus events for party member items
            if (!partFrame) {
                // adds item to attack log
                $("#" + id).focus((e) => {
                    // $(item).removeClass("item");
                    $(itemPos).addClass("item-clicked");
                    this.focusedItem = item.name;
                    this.addToLog(item);

                });
                // deletes item to attack log
                $(itemPos).focusout(() => {
                    $(itemPos).removeClass("item-clicked");
                    // if innerText isn't anymore the clicked item
                    if (this.focusedItem != item.name) {
                        this.deleteFromLog(item);
                    }
                });
            }

            itemSlot.addEventListener("mouseover", (e) => {
                let toolTip = document.getElementById("tooltip");
                this.fillDivWithItemData(id);
                // sets position of tooltip to mouse coords
                $('#tooltip').css({
                    'top': e.pageY + 10,
                    'left': e.pageX + 10,
                    'position': 'absolute'
                });
                toolTip.style.display = "block";
            });
            itemSlot.addEventListener("mouseout", (e) => {
                let toolTip = document.getElementById("tooltip");
                toolTip.style.display = "none";
            });



            let image = document.createElement("img");

            // choose image by item type
            switch (item.type) {
                case "weapon":
                    image.src = `res/items/${item.type}_${item.range}.png`;
                    break;
                default:
                    image.src = `res/items/${item.type}.png`;
                    break;
            }
            itemSlot.style.backgroundColor = "black";
            itemSlot.appendChild(image);

            itemPos.appendChild(itemSlot);
        }
    }

    // adds item.name to log 
    addToLog(item) {
        if ($("#attack-log").is(":visible")) {
            if (weaponToBeUsed.innerText != item.name) {
                weaponToBeUsed.innerText = item.name;
            }
        }
        if ($("#heal-log").is(":visible")) {
            if (itemToBeUsed.innerText != item.name) {
                itemToBeUsed.innerText = item.name;
            }
        }
        if ($("#trade-swap-log").is(":visible")) {
            if ($("#swapBtn").data('clicked')) {
                if (itemOrPlayerForTrade.innerText != item.name) {
                    itemOrPlayerForTrade = item.name;
                }
            }
        }
        if ($("#drop-log").is(":visible")) {
            if (itemToDrop.innerText != item.name) {
                itemToDrop = item.name;
            }
        }
    }
    // shows Item Stats on hover
    fillDivWithItemData(id) {
        let item = this.clientSideItemManager[id];

        // setting variables for each Stat Div
        let range = document.getElementById("tooltip-item-range");
        let heal = document.getElementById("tooltip-item-heal");
        let cost = document.getElementById("tooltip-item-cost");
        let dmg = document.getElementById("tooltip-item-dmg");

        document.getElementById("tooltip-item-name").innerHTML = `${item.name}`;
        document.getElementById("tooltip-item-type").innerHTML = `Type: ${item.type}`;

        // hide stats if null otherwise show them
        if (item.range !== "") {
            range.innerHTML = `Range: ${item.range}`;
            range.style.display = "block";
        } else {
            range.style.display = "none";
        }
        if (item.heal > 0) {
            heal.innerHTML = `Heal: ${item.heal}`;
            heal.style.display = "block";
        } else {
            heal.style.display = "none";
        }
        if (item.cost > 0) {
            cost.innerHTML = `Cost: ${item.cost}`;
            cost.style.display = "block";
        } else {
            cost.style.display = "none";
        }
        if (item.dmg > 0) {
            dmg.innerHTML = `Damage: ${item.dmg}`;
            dmg.style.display = "block";
        } else {
            dmg.style.display = "none";
        }
    }


    // displays Inventory Clientside
    showInventory() {
        if (this.onServer) {
            this.socket.emit("updateInventory", getInventory());
            return;
        }
        removeAllItems();
        createInventory();
    }

    // removes Items from UI
    removeAllItems() {
        let active = document.getElementById("active-items");
        let bag = document.getElementById("bag-items");
        let bagh3 = document.createElement("h3");
        let activeh3 = document.createElement("h3");
        let h3Class = "inventory-h3";
        bagh3.className = h3Class;
        activeh3.className = h3Class;

        while (active.firstChild) {
            active.removeChild(active.firstChild);
        }
        activeh3.textContent = "Aktiv";
        active.appendChild(activeh3);
        while (bag.firstChild) {
            bag.removeChild(bag.firstChild);
        }
        bagh3.textContent = "Tasche";
        bag.appendChild(bagh3);

    }

    // adds Item
    addItem(item) {
        if (activeItemSlots > this.activeItems.length) {
            this.activeItems.push(item);
            changedFlag = 1;
            console.log(this.activeItems);
        } else if (bagSize > this.bag.length) {
            this.bag.push(item);
            changedFlag = 1;
            console.log(this.bag);
        }
        showInventory();
    }

    // Drops Item into the Void
    dropItem(item) {
        let whichAr = this.findItemInInventory(item);
        if (whichAr === "active") {
            this.activeItems.splice(this.activeItems.indexOf(item), 1);
        } else {
            this.bag.splice(this.bag.indexOf(item), 1);
        }
        changedFlag = 1;
        showInventory();
    }

    // helper function to find Item in inventory
    findItemInInventory(item) {
        if (this.activeItems.indexOf(item) != -1) {
            return "active";
        } else {
            return "bag";
        }
    }

    // returns inventory
    getInventory() {
        let inventory = [];
        inventory.push(this.activeItems);
        inventory.push(this.bag);
        return inventory;
    }

    getChangedFlag() {
        if (this.changedFlag > 0) {
            let x = true;
            this.changedFlag = 0;
            return x;
        } else {
            return false;
        }
    }
    // returns true if inventory is full
    isInventoryFull() {
        if (this.bagSize <= this.bag.length && this.activeItemSlots <= this.activeItems.length) {
            return true;
        }
        return false;
    }

    // returns item object
    getItem(name) {
        for (let i in this.activeItems) {
            if (name === this.activeItems[i].name) {
                return this.activeItems[i];
            }
        }
        for (let i in this.bag) {
            if (name === this.bag[i].name) {
                return this.bag[i];
            }
        }
    }

}
// module.exports = Inventory;