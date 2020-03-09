const state = {
    CONNECTED: "CONNECTED",
    LOBBY: "IN LOBBY",
    INGAME: "IN GAME"
}

class User {
    constructor(socket) {
        this.socket = socket;
        this.username = "";
        this.sessionID = socket.id;
        this.originalID = "";
        this.roomname = "";
        this.character = "";
        this.ready = false;
        this.leader = false;
        this.online = true;
        this.state = state.CONNECTED;
    }

    changeState() {
        if(this.state == "CONNECTED") {
            this.state = state.LOBBY;
        } else if (this.state == "IN LOBBY") {
            this.state = state.INGAME;
        } else {
           this.state = state.CONNECTED;
        }
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
        this.changeState();
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

    setName(username) {
        this.username = username;
    }

    setOriginalId(id) {
        this.originalID = id;
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