class Item {
    constructor (param) {
        this.name = param.name;
        this.type = param.type;
        // setters
        // sets range
        if (param.range) { this.range = param.range; }
        // sets dmg
        if (param.dmg) { this.dmg = param.dmg; }
        // sets heal
        if (param.heal) { this.heal = param.heal; }
        // sets cost
        if (param.cost) { this.cost = param.cost; }
        // sets trigger
        if (param.trigger) { this.trigger = param.trigger; }
        // sets dice
        if (param.dice) { this.dice = param.dice; }

    }    

}