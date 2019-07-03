// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 5000;
app.set('port', port);


require("./server/routes")(app, path, express);

// Starts the server.
server.listen(port, function () {
    console.log(`Started server on port ${port}`);
});

// const game = require("./server/js/game/Game")(io);
// game.launch();

// uncomment if not working properly
// const conn = 
require("./server/js/Connection")(io);