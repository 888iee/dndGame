const User = require("./User");

class UserList {
    static list = [];

    // adds Player to this.connected
    static addUser(socket) {
        let user = new User(socket);
        this.list.push(user);
    }

    // moves user to another state
    static changeState(roomName) {
        let users = this.getUsersInRoom(roomName);
        for(let i = 0; i < users.length; i++) {
            users[i].changeState();
        }
    }

    // searchs user in all arrays
    static getUser(sessID) {
        return this.list.find(user => user.sessionID == sessID);
    }

    // Returns all Users as Array
    static getAllUsers() {
        return this.list;
    }

    // Returns all Users in Room as Array
    static getUsersInRoom(roomName) {
        return this.list.filter(user => user.roomname == roomName);
    }

    // Removes User from list
    static removeUser(sessID) {
        let user = this.getUser(sessID);
        if(typeof user != undefined) {
            this.list.splice(this.list.indexOf(user), 1);
        }
    }
}

module.exports = UserList;