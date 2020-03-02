const User = require("./User");

class UserList {
    constructor() {
        this.list = [];
    }

    // adds Player to this.connected
    addUser(socket) {
        let user = new User(socket);
        this.list.push(user);
    }

    // moves user to another state
    changeState(roomName) {
        let users = this.getUsersInRoom(roomName);
        for(let i = 0; i < users.length; i++) {
            users[i].changeState();
        }
    }

    // searchs user in all arrays
    getUser(sessID) {
        return this.list.find(user => user.sessionID == sessID);
    }

    // Returns all Users as Array
    getAllUsers() {
        return this.list;
    }

    // Returns all Users in Room as Array
    getUsersInRoom(roomName) {
        return this.list.filter(user => user.roomname == roomName);
    }

    // Removes User from list
    removeUser(sessID) {
        let user = this.getUser(sessID);
        if(typeof user != undefined) {
            this.list.splice(this.list.indexOf(user), 1);
        }
    }
}

module.exports = UserList;