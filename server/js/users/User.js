class User {
    constructor(socket) {
        this.socket = socket;
        this.username = socket.username;
        this.sessionID = socket.id;
        this.originalID = socket.originID;
        this.roomname = "";
        this.character = "";
        this.ready = false;
        this.leader = false;
        this.online = true;
    }

    // returns ID
    getID() {
        return this.sessionID;
    }

    // returns name
    getName() {
        return this.username;
    }

    // returns boolean 
    isLeader() {
        return this.leader;
    }

    // returns boolean 
    isReady() {
        return this.ready;
    }

    // joins room
    joinRoom(roomname) {
        this.roomname = roomname;
    }

    // leaves room
    leaveRoom() {
        this.roomname = "";
    }

    // grants leadership
    makeLeader() {
        this.leader = true;
    }

    // revokes leadership
    revokeLeader() {
        this.leader = false;
    }

    // sets character
    setCharacter(character) {
        this.character = character;
    }

    // set ready to true
    setReady() {
        this.ready = true;
    }

    // removes character
    unsetCharacter() {
        this.character = "";
    }

    // set ready to true
    unsetReady() {
        this.ready = false;
    }
}

module.exports = User;