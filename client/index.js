const socketUrl = 'http://localhost:5000';

let connectButton;
let disconnectButton;
let socket;
let statusInput;
let tokenInput;


const connect = () => {
    let error = null;

    socket = io(socketUrl, {
        autoConnect: false,
    });

    socket.on('connect', () => {
        console.log('Connected');
        statusInput.value = 'Connected';
        connectButton.disabled = true;
        disconnectButton.disabled = false;

        socket.emit('authentification', {
            token: tokenInput.value,
        });
    });

    socket.on('unauthorized', (reason) => {
        console.log('Unauthorized:', reason);

        error = reason.message;

        socket.disconnect();
    });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${error || reason}`);
        statusInput.value = `Disconnected: ${error || reason}`;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        error = null;
    });

    socket.open();
};

const disconnect = () => {
    socket.disconnect();
}

document.addEventListener('DOMContentLoaded', () => {
    connectButton = document.getElementById('connect');
    disconnectButton = document.getElementById('disconnect');
    statusInput = document.getElementById('status');
    tokenInput = document.getElementById('token');
    nickname = document.getElementById("nick");
});

let btn = document.getElementById("createCookie")

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


btn.addEventListener("click", () => {
    setCookie("nick", nickname.value, 2000);
});