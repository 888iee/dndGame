const LobbyHandler = require("./LobbyHandler");

class Message {
    constructor(){}

    // sends chat to sockets
    getChat(socket, data) {
        let roomName = Lobbyist.getLobbyBySocket(socket);
        io.to(roomName).emit("getChat", `${socket.username}: ${data}`);
    }

    // sends welcome msg to client and broadcast to 
    // all other members of client's room a notification
    welcomeToRoomMessage(sock) {
        setTimeout(() => {
            let lobbyName = LobbyHandler.getLobbyBySocket(sock).getRoomName();
            // Welcome Message for Player
            sock.emit("getChat", `Wilkommen im Raum <br>${lobbyName}.`);
            // Notification in Chat for other Room Members
            sock.broadcast.volatile.to(lobbyName).emit("getChat", `${sock.username} ist dem Raum beigetreten.`);
        });
    }
}
module.exports = Message;