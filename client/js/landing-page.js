$(document).ready(function () {

    // click event to open popup
    $("#openFormBtn").click((e) => {
        $(".lobby").toggleClass("blur");
        $("#popup").show();
        $("#room-name").attr("placeholder", `Zimmer von ${getCookie("id")}`);
    });
    doesAuthCookieExist = () => {
        if (getCookie("auth") !== "") {
            return true;
        }
    }
    // shows login form
    if (!doesAuthCookieExist()) {
        showLoginForm();
    }

    // creates cookie with username
    $("#logInBtn").click(() => {
        submitID();
    });

    // checks if cookie exist
    if (getCookie("id") !== "") {
        changeUserData();
        initSockConnection();
    }
    // toggles public/private room
    $("#toggle1").click(() => {
        if ($("#toggle1").is(".unselected")) {
            toggleButtons();
            $(".password-row").hide();
        }
    });
    $("#toggle2").click(() => {
        if ($("#toggle2").is(".unselected")) {
            toggleButtons();
            $(".password-row").css("display", "flex");
        }
    });

    // hides popup
    $(".cancel-area").click(() => {
        hidePopUp();
    });

    // sends data to server
    $(".create-room-button").click(() => {
        if ($("#room-name").val() === "") {
            roomName = $("#room-name").attr("placeholder");
        } else {
            roomName = $("#room-name").val();
        }
        if ($("#password").is(":visible")) {
            password = $("#password").val();
            public = false;
        } else {
            password = "";
            public = true;
        }
        // !! needs to be changed when 
        // !! players are editable for client
        maxPlayers = 2;
        send();
    });

    $("#chat-form").submit(e => {
        e.preventDefault();
        sendToServer()
    });
    $("#refreshBtn").click(() => {
        requestList();
    })
});
let updateChampSelect = () => {

    let cAr = ["c1", "c2", "c3", "c4", "c5"];
    // console.log(characters);
    for (let j = 0; j < characters.length; j++) {
        $("#" + cAr[j] + "name").text(characters[j].name);
        $("#" + cAr[j] + "img").attr("src", characters[j].img);
        $("#" + cAr[j] + "info").text(characters[j].info);
        $("#" + cAr[j] + "stats").text(characters[j].stats);
    }

}

let toggleButtons = () => {
    $("#toggle1").toggleClass("unselected");
    $("#toggle2").toggleClass("unselected");
}
// changes sidebar information
let changeUserData = () => {
    $(".side-bar-user-name").text(getCookie("id"));
}

let submitID = () => {
    if ($("#username").val() !== "") {
        console.log($("#username").val())
        setCookie("id", $("#username").val(), 99999);
        $("#login").hide();
        $(".lobby").toggleClass("blur");

        initSockConnection();

        changeUserData();
    }
}

// initializes socket communication
let initSockConnection = (pass) => {
    let socket = io();
    socket.on("connect", () => {

        pass = socket.id + "&&" + getCookie("id");
        if (getCookie("auth") === "") {
            setCookie("auth", pass, 9999999);
            socket.emit("cookieCreated", getCookie("auth"));
        } else {
            // console.log("Cookie: \n " + getCookie("auth"));
            socket.emit("authenticate", getCookie("auth"));
        }
        // Room create request
        send = () => {
            socket.emit("createRoom", {
                "roomName": roomName,
                "password": password,
                "public": public,
                "max_players": maxPlayers,
            });
        }

        // listen for roomlist 
        socket.on("getList", (data) => {
            insertList(data);
        });
        // error console
        socket.on("error", (data) => {
            console.log(data);
        });

        // displays messages from server
        socket.on("getChat", (data) => {
            $("#chat-content").append(`<div> ${data} </div>`);
        });

        // listen for create room request auth
        socket.on("openRoom", data => {
            // hide roomlist
            $("#roomList").css("display", "none");
            $("#roomName").text(data.roomName);

            // TODO: load champion info 
            updateChampSelect()
            // TODO: enable champion select 

            // TODO: show lobby
            $(".lobby-room").css("display", "block");
            hidePopUp();
        });

        socket.on("addPlayer", data => {
            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                for (let j = 1; j < 5; j++) {
                    if ($(`.player-list > div:contains(${data[i].name})`).length <= 0) {

                        // change to jquery 
                        if ( // check if member is called already or not
                            document.getElementById("p" + j).innerText == ""
                        ) {
                            // if not add player to list
                            $("#p" + j).text(data[i].name)
                            // document.getElementById("p" + i).innerText == data.name;
                            return
                        }
                    }
                }
            }
        });
        // send chat message to server
        sendToServer = () => {
            if ($("#chat-input").val() !== "") {
                socket.emit("getChat", $("#chat-input").val());
                $("#chat-input").val("");
            } else {
                console.log("No Text")
            }
        }

        // request roomlist
        requestList = () => socket.emit("reqList");

        joinRoom = (name, public) => {
            // TODO: ask if public ..
            socket.emit("joinToRoom", {
                "name": name,
                "public": public
            });
        }
    });
}

// deletes complete room list
let deleteList = () => {
    $(".room-list-body div[class^='room-list-element']").remove();
}


// appends roomlist
let insertList = (roomList, joinBtn) => {
    deleteList();
    for (let i = 0; i < roomList.length; i++) {
        // console.log(`Room to check ${roomList[i].roomName}, ${roomList[i].public}`)
        //     let roomStr = `<div class="room-list-element">
        // <div class="column column-private">${roomList[i].public}</div>
        // <div class="column column-name">${roomList[i].roomName}</div>
        // <div class="column column-player-count">${roomList[i].player_count}/${roomList[i].max_players}</div>
        // `;

        let container = createDiv("c");
        container.appendChild(createDiv("private", roomList[i].public));
        container.appendChild(createDiv("name", roomList[i].roomName));
        container.appendChild(createDiv("player-count", `${roomList[i].player_count}/${roomList[i].max_players}`));
        let btn = document.createElement("button");
        btn.className = "button column-btn join-btn";
        btn.innerHTML = 'JOIN';

        // btn.addEventListener("click", joiiinRoom(roomList[i].roomName, roomList[i].public));
        btn.addEventListener("click", e => {
            e.preventDefault();
            if (e.target) {
                joinRoom(roomList[i].roomName, roomList[i].public);
            }
        });
        // if (!roomList[i].canIJoin) {
        //     btn.disabled = "disabled";
        // }
        container.appendChild(btn);
        document.getElementById("room-list-body").appendChild(container);
        // else {
        //     $(".room-list-body").append(roomStr.concat("</div>"));
        // }
    }
}


let createDiv = (type, name) => {
    let div = document.createElement("div");
    if (type == "c") {
        div.className = "room-list-element";
    } else {
        div.className = `column column-${type}`;
        div.innerHTML = name;
    }
    return div;
}

// listens for escape key
$(document).keydown((e) => {
    if (e.keyCode == 27 && $("#room-form").is(":visible")) {
        hidePopUp()
    }
    if (e.keyCode == 13 && $("#login").is(":visible") && $("#username").val() !== "") {
        submitID();
    }
});



let showLoginForm = () => {
    $("#login").show();
    $(".lobby").toggleClass("blur");
}
// hides popup
let hidePopUp = () => {
    $(".popup-overlay").hide();
    $(".lobby").toggleClass("blur");
}


$(".cancel-button").click(() => {
    hidePopUp()
});