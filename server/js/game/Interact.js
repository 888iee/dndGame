fs = require("fs");

class Interact {
    constructor(player1) {
        this.player1 = player1;
        this.mapJSON = fs.readFileSync("./server/lib/map.json", {
            encoding: "utf8"
        });
        this.map = JSON.parse(this.mapJSON);
        this.obstacles = this.map[this.player1.isOnMap].obstacles;
    }

    // determines attack
    attack(player2, item) {
        console.log("im in attack");
        if (this.player1.isOnMap === player2.isOnMap) {
            if (item) {
                // 1. item.exist
                if (this.player1.inventory.isItemActive(item)) {
                    // 1. in Range
                    if (this.player1.getDistance(player2) === "melee") {
                        // 3. damage-armor
                        player2.setDamage(item.dmg);
                        this.player1.sock.emit("log", "Du hast " + player2.name + " " + item.dmg + " Schaden zugefügt.");
                        this.player1.actions++;
                        return true;
                    } else {
                        // 2. blocked by obstacles?
                        // this.physics = Physics(this.player1);
                        if (this.canAttackPass(player2)) {
                            // 3. damage-armor
                            player2.setDamage(item.dmg);
                            this.player1.sock.emit("log", "Du hast " + player2.name + " " + item.dmg + " Schaden zugefügt.");
                            this.player1.actions++;
                            return true;
                        } else {
                            this.player1.sock.emit("log", "Du kannst nicht durch Objekte schießen.");
                            return false;
                        }
                    }
                }
            } else {
                if (this.player1.getDistance(player2) === "melee") {
                    this.player1.actions++;;
                    player2.setDamage(1);
                    this.player1.sock.emit("log", "Du hast " + player2.name + " geohrfeigt.");
                    return true;
                }
            }
        } else {
            console.log("Du kannst keine Spieler in anderen Räumen angreifen.");
            return false;
        }
    }

    // heals player
    heal(player2, item) {
        if (this.player1.id !== player2.id) {
            if (this.player1.isOnMap === player2.isOnMap) {
                if (item) {
                    if (this.player1.inventory.isItemActive(item)) {
                        if (this.player1.getDistance(player2) === "melee") {
                            player2.setHeal(item.heal);
                            this.player1.sock.emit("log", "Du hast " + player2.name + " um " + item.heal + " geheilt.");
                            this.player1.actions++;
                            return true;
                        }
                    }
                } else {
                    if (this.player1.getDistance(player2) === "melee") {

                        // CLASS SPELL HEAL
                        // this.player1.actions++;
                        // player2.setHeal();
                        // this.player1.sock.emit("log", "Du hast " + player2.name + " um " + item.heal + " geheilt.");
                        // return true;
                    }
                }
            }
        } else {
            if (item) {
                if (this.player1.inventory.isItemActive(item)) {
                    this.player1.actions++;
                    player2.setHeal(item.heal);
                    this.player1.sock.emit("log", "Du hast " + player2.name + " um " + item.heal + " geheilt.");
                    return true;
                }
            } else {
                // CLASS SPELL HEAL
                // this.player1.actions++;
                // player2.setHeal();
                // this.player1.sock.emit("log", "Du hast " + player2.name + " um " + item.heal + " geheilt.");
                // return true;
            }
        }
    }

    // helper function
    // returns true if attack can't be blocked by obstacles
    canAttackPass(player2) {
        // iterate through array
        for (let i in obstacles) {
            for (let j = 1; j < obstacles[i].length; j++) {
                // let r be x,y of obstacle
                let r = {
                    x: obstacles[i][j][1],
                    y: obstacles[i][j][2]
                };
                // // check if attack will intersect with r
                if (this.intersects(this.player1.x, this.player1.y, player2.x, player2.y, r.x, r.y, r.x, r.y + 1) ||
                    this.intersects(this.player1.x, this.player1.y, player2.x, player2.y, r.x, r.y + 1, r.x + 1, r.y + 1) ||
                    this.intersects(this.player1.x, this.player1.y, player2.x, player2.y, r.x + 1, r.y + 1, r.x + 1, r.y) ||
                    this.intersects(this.player1.x, this.player1.y, player2.x, player2.y, r.x + 1, r.y, r.x, r.y)) {
                    return false;
                }
            }
        }
        return true;
    }

    // helper function
    // returns true if obj intersects attack
    intersects(a, b, c, d, p, q, r, s) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };
}

module.exports = Interact;