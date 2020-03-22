let myID;
let ready = false;
let addClassesToCharacters = chars => {
  let ar = Object.keys(chars);
  // iterate through received data and reassign css classes
  for (let i = 0; i < ar.length; i++) {
    // check if char was chosen by myself
    if (chars[ar[i]] === $(".side-bar-user-name").text()) {
      selected = true;
      $(`#${ar[i]}`).addClass("selectedChamp");
      $(`#${ar[i]}`).removeClass("notSelected someoneElseSelected");
    } else if (chars[ar[i]] === "none") {
      // check if char isn't selected
      $(`#${ar[i]}`).addClass("notSelected");
      $(`#${ar[i]}`).removeClass("selectedChamp someoneElseSelected");
    } else {
      // was selected by other players
      $(`#${ar[i]}`).addClass("someoneElseSelected");
      $(`#${ar[i]}`).removeClass("selectedChamp notSelected");
    }
  }
};
$(document).ready(function() {
  // click event to open popup
  $("#openFormBtn").click(e => {
    $(".lobby").toggleClass("blur");
    $("#popup").show();
    $("#room-name").attr("placeholder", `Zimmer von ${getCookie("id")}`);
  });
  doesAuthCookieExist = () => {
    if (getCookie("auth") !== "") {
      return true;
    }
  };
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
    sendToServer();
  });
  $("#refreshBtn").click(() => {
    requestList();
  });
  $("#readyBtn").click(() => {
    let children = $(".champion-select").children();
    // iterate over all champion
    for (let i = 0; i < children.length; i++) {
      // check if one is selected by player
      if ($(`#${children[i].id}`).hasClass("selectedChamp")) {
        // if so check ready state
        if (!ready) {
          ready = true;
          $("#readyBtn").addClass("clicked");
        } else {
          ready = false;
          $("#readyBtn").removeClass("clicked");
        }
        console.log(ready);
        sendReady(ready);
      }
    }
  });
  // $("#readyBtn").attr("disabled", true);
});
let updateChampSelect = () => {};

let toggleButtons = () => {
  $("#toggle1").toggleClass("unselected");
  $("#toggle2").toggleClass("unselected");
};
// changes sidebar information
let changeUserData = () => {
  $(".side-bar-user-name").text(getCookie("id"));
};

let submitID = () => {
  if ($("#username").val() !== "") {
    console.log($("#username").val());
    setCookie("id", $("#username").val(), 99999);
    $("#login").hide();
    $(".lobby").toggleClass("blur");

    initSockConnection();

    changeUserData();
  }
};

// initializes socket communication
let initSockConnection = pass => {
  let socket = io();
  socket.on("connect", () => {
    socket.on("id", id => (myID = id));

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
        roomName: roomName,
        password: password,
        public: public,
        max_players: maxPlayers
      });
    };
    sendSelection = char => {
      socket.emit("select", char);
    };
    sendReady = ready => {
      socket.emit("rdy", ready);
    };
    socket.on("selection", chars => {
      let selected = false;
      let children = $(".champion-select").children();
      removeAllClassesFromCharacters();
      addClassesToCharacters(chars);
      // if (selected) {
      //     $("#readyBtn").attr("disabled", false);
      // } else {
      //     $("#readyBtn").attr("disabled", true);
      // }
    });
    socket.on("startSelect", chars => {
      removeAllClassesFromCharacters();
      addClassesToCharacters(chars);
      // TODO: Add Notification for Champ Select
    });
    // listen for roomlist
    socket.on("getList", data => {
      insertList(data);
    });
    // error console
    socket.on("error", data => {
      console.log(data);
    });

    // displays messages from server
    socket.on("getChat", data => {
      $("#chat-content").append(`<div> ${data} </div>`);
    });

    // listen for create room request auth
    socket.on("openRoom", data => {
      // hide roomlist
      $("#roomList").css("display", "none");
      $("#roomName").text(data.roomName);

      updateChampSelect();
      // TODO: enable champion select

      $(".lobby-room").css("display", "block");
      hidePopUp();
    });
    let deletePlayerList = () => {
      for (let i = 0; i < 5; i++) {
        $(`#p${i}`).text("");
      }
    };
    // updates player list
    socket.on("addPlayer", data => {
      deletePlayerList();
      console.table(data);
      for (let i = 0; i < data.length; i++) {
        let player = $(`#p${i + 1}`);
        // set Player Name
        player.text(data[i].username);
        // Set Character if selected
        if (data[i].character && data[i].character !== "none") {
          player.append(` - ${data[i].character} `);
        }
        // Set Lead if lead
        if (data[i].leader === true) {
          player.append(" - Lead");
        }
        // Set Ready if ready
        if (data[i].ready) {
          player.append("ready");
        }
      }
    });
    // send chat message to server
    sendToServer = () => {
      if ($("#chat-input").val() !== "") {
        socket.emit("getChat", $("#chat-input").val());
        $("#chat-input").val("");
      } else {
        console.log("No Text");
      }
    };

    socket.on("redirect", url => (window.location.href = url));
    // request roomlist
    requestList = () => socket.emit("reqList");

    joinRoom = (name, public) => {
      // TODO: ask if public ..
      socket.emit("joinToRoom", {
        roomName: name,
        public: public
      });
    };

    updateChampSelect = () => {
      $.ajax({
        type: "GET",
        // TODO: change url
        url: "http://localhost:5000/chars",
        dataType: "json",
        success: chars => {
          let characters = JSON.parse(chars);
          for (let j = 0; j < characters.length; j++) {
            $(`#c${j + 1}name`).text(characters[j].name);
            $(`#c${j + 1}img`).attr("src", characters[j].img);
            $(`#c${j + 1}info`).text(characters[j].info);
            $(`#c${j + 1}stats`).text(characters[j].stats);
            $(`#c${j + 1}name`).click(e => {
              e.stopPropagation();
              e.preventDefault();
            });
            $(`#c${j + 1}img`).click(e => {
              e.stopPropagation();
              e.preventDefault();
            });
            $(`#c${j + 1}info`).click(e => {
              e.stopPropagation();
              e.preventDefault();
            });
            $(`#c${j + 1}stats`).click(e => {
              e.stopPropagation();
              e.preventDefault();
            });
            // only click event
            $(`#c${j + 1}`).click(e => {
              if (!ready) {
                sendSelection({
                  id: `c${j + 1}`,
                  name: $(`#${e.target.id}name`).text()
                });
              }
            });
          }
        }
      }).fail((jqXHR, textStatus) => {
        console.log("AJAX ERROR: ", textStatus);
      });
    };
  });
};

// deletes complete room list
let deleteList = () => {
  $(".room-list-body div[class^='room-list-element']").remove();
};

// appends roomlist
let insertList = (roomList, joinBtn) => {
  console.table(roomList);
  deleteList();
  for (let i = 0; i < roomList.length; i++) {

    let container = createDiv("c");
    container.appendChild(createDiv("private", roomList[i].public));
    container.appendChild(createDiv("name", roomList[i].roomName));
    container.appendChild(
      createDiv(
        "player-count",
        `${roomList[i].playerCount}/${roomList[i].max_players}`
      )
    );
    let btn = document.createElement("button");
    btn.className = "button column-btn join-btn";
    btn.innerHTML = "JOIN";

    // btn.addEventListener("click", joiiinRoom(roomList[i].roomName, roomList[i].public));
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (e.target) {
        joinRoom(roomList[i].roomName, roomList[i].public);
        console.log(roomList[i].roomName, roomList[i].public);
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
};

let createDiv = (type, name) => {
  let div = document.createElement("div");
  if (type == "c") {
    div.className = "room-list-element";
  } else {
    div.className = `column column-${type}`;
    div.innerHTML = name;
  }
  return div;
};

// listens for escape key
$(document).keydown(e => {
  if (e.keyCode == 27 && $("#room-form").is(":visible")) {
    hidePopUp();
  }
  if (
    e.keyCode == 13 &&
    $("#login").is(":visible") &&
    $("#username").val() !== ""
  ) {
    submitID();
  }
});

let removeAllClassesFromCharacters = () => {
  let children = $(".champion-select").children();
  // removes all classes from characters
  for (let i = 0; i < children.length; i++) {
    if (
      $(`#${children[i].id}`).hasClass("someoneElseSelected") ||
      $(`#${children[i].id}`).hasClass("selectedChamp")
    ) {
      try {
        $(`#${children[i].id}`).removeClass(
          "someoneElseSelected notSelected selectedChamp"
        );
      } catch (error) {}
    }
    $(`#${children[i].id}`).addClass("notSelected");
  }
};

let showLoginForm = () => {
  $("#login").show();
  $(".lobby").toggleClass("blur");
};
// hides popup
let hidePopUp = () => {
  $(".popup-overlay").hide();
  $(".lobby").toggleClass("blur");
};

$(".cancel-button").click(() => {
  hidePopUp();
});
