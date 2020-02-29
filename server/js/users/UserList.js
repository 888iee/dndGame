const User = require("./User");

class UserList {
    constructor() {
        // states
        this.connected = [];
        this.lobby = [];
        this.ingame = [];
    }

    // adds Player to this.connected
    addUser(socket) {
        let user = new User(socket);
        // users will always get into state connected first
        this.connected.push(user);
    }

    // moves user to another state
    changeState(state) {

    }
}
module.exports = UserList;