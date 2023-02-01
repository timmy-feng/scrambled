const GameState = require("../shared/gameState");
const { GAME } = require("../shared/constants");

const User = require("./models/user");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const UPDATES_PER_SEC = 10;

const rooms = {};
const userToGameMap = {};
const userToRoomMap = {};

const results = {};

const startGame = (user, map) => {
  if (!(user._id in userToRoomMap)) return;

  const room = [...rooms[userToRoomMap[user._id]]];
  if (room[0] != user) return;

  const game = new GameState({ map });
  for (const user of room) {
    delete results[user._id];
    results[user._id] = { user, stats: {} };

    leaveRoom(user);
    delete userToRoomMap[user._id];

    userToGameMap[user._id] = game;
    User.findOne({ _id: user._id }).then((serverUser) => {
      game.spawnEgg(user._id, serverUser ? serverUser.costume : 0);
      userToSocketMap[user._id].emit("startgame");
    });
  }

  const sendLoop = setInterval(() => {
    for (const user of room) {
      if (userToGameMap[user._id] == game)
        userToSocketMap[user._id]?.emit("update", {
          gameState: game,
        });
    }
  }, 1000 / UPDATES_PER_SEC);

  let isGameOver = false;
  const updateLoop = setInterval(() => {
    for (const update of game.update()) {
      if (update.id in results) {
        if (!(update.type in results[update.id].stats))
          results[update.id].stats[update.type] = 0;
        results[update.id].stats[update.type] += 1;
      }
    }

    if (!isGameOver && game.isGameOver()) {
      isGameOver = true;
      // let game play out a bit before ending
      setTimeout(() => {
        for (const user of room) {
          if (user._id in results) {
            results[user._id].won = user._id == game.eggs[0]?.id;

            const update = { ...results[user._id].stats };
            if (results[user._id].won) {
              update.win = 1;
            }
            update[game.map] = 1;
            update.game = 1;

            User.updateOne({ _id: user._id }, { $inc: update }).then((res) => {
              if (res.n) {
                console.log("Updated user " + user.name);
              } else {
                console.log("Did not find user " + user.name);
              }
            });
          }
          userToSocketMap[user._id]?.emit("gameover");
          delete userToGameMap[user._id];
        }

        clearInterval(sendLoop);
        clearInterval(updateLoop);
      }, 2000);
    }
  }, 1000 / GAME.FRAMES_PER_SEC);
};

const getRandomCode = () => {
  let roomCode = "";
  for (let i = 0; i < 4; i++) {
    roomCode += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  return roomCode in rooms ? getRandomCode() : roomCode;
};

const createRoom = (user) => {
  if (user._id in userToRoomMap) return;
  const roomCode = getRandomCode();
  rooms[roomCode] = [];
  joinRoom(user, roomCode);
};

const joinRoom = (user, roomCode) => {
  if (user._id in userToRoomMap) return;
  if (roomCode in rooms) {
    rooms[roomCode].push(user);
    userToRoomMap[user._id] = roomCode;
    io.emit("updaterooms", rooms);
  }
};

const leaveRoom = (user) => {
  if (user._id in userToRoomMap) {
    const players = rooms[userToRoomMap[user._id]];
    players.splice(players.indexOf(user), 1);

    if (players.length == 0) {
      delete rooms[userToRoomMap[user._id]];
    }

    delete userToRoomMap[user._id];
    io.emit("updaterooms", rooms);
  }
};

const leaveGame = (user) => {
  if (user._id in userToGameMap) {
    userToGameMap[user._id].disconnectEgg(user._id);
    delete userToGameMap[user._id];
  }
};

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    oldSocket.close();
    removeUser(user, oldSocket);
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;

  console.log(`${user._id} joined`);
};

const removeUser = (user, socket) => {
  if (user) {
    delete userToSocketMap[user._id];
    delete results[user._id];
    leaveRoom(user._id);
    leaveGame(user._id);
  }
  delete socketToUserMap[socket.id];
};

const enabledCostumes = (user) => {
  const enabled = Array(8);
  enabled[0] = true;
  enabled[1] = user.game >= 1;
  enabled[2] = user.game >= 50;
  enabled[3] = user.kill >= 10;
  enabled[4] = user.kill >= 100;
  enabled[5] = user.seaweed >= 50;
  enabled[6] = user.scallion >= 500;
  enabled[7] = user.fishcake >= 1000;
  return enabled;
};

const initGeckos = async (server, port) => {
  const geckos = await import("@geckos.io/server");
  io = geckos.geckos();
  io.addServer(server);

  io.onConnection((socket) => {
    console.log(`socket has connected ${socket.id}`);

    socket.onDisconnect(() => {
      const user = socketToUserMap[socket.id];
      console.log(`socket has disconnected ${socket.id}`);
      removeUser(user, socket);
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });

    socket.on("requestcostumes", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        User.findOne({ _id: user._id }).then((serverUser) => {
          if (serverUser) {
            socket.emit("costumes", {
              selected: serverUser.costume,
              enabled: enabledCostumes(serverUser),
            });
          } else {
            socket.emit("costumes", {
              selected: 0,
              enabled: [true, false, false, false, false, false, false, false],
            });
          }
        });
      }
    });

    socket.on("setcostume", (costume) => {
      const user = socketToUserMap[socket.id];
      if (user && enabledCostumes(user)[costume]) {
        User.updateOne({ _id: user._id }, { costume: costume }).then(
          (update) => {
            User.findOne({ _id: user._id }).then((user) => console.log(user));
          }
        );
      }
    });

    socket.on("requestrooms", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        socket.emit("updaterooms", rooms);
        if (user._id in userToRoomMap) {
          socket.emit("updateroom", userToRoomMap[user._id]);
        }
      }
    });

    socket.on("createroom", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        createRoom(user);
        socket.emit("updateroom", userToRoomMap[user._id]);
      }
    });

    socket.on("joinroom", (roomCode) => {
      const user = socketToUserMap[socket.id];
      if (user) {
        joinRoom(user, roomCode);
        socket.emit("updateroom", roomCode);
      }
    });

    socket.on("leaveroom", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        leaveRoom(user);
        socket.emit("updateroom", undefined);
      }
    });

    socket.on("startgame", (map) => {
      const user = socketToUserMap[socket.id];
      if (user) {
        startGame(user, map);
      }
    });

    socket.on("leavegame", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        leaveGame(user);
      }
    });

    socket.on("requestresults", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        if (user._id in results && !(user._id in userToGameMap)) {
          socket.emit("results", results[user._id]);
        } else {
          socket.emit("results");
        }
      }
    });

    socket.on("input", (input) => {
      const user = socketToUserMap[socket.id];
      if (user) {
        userToGameMap[user._id]?.handleInput(user._id, input);
      }
    });
  });
};

module.exports = {
  init: initGeckos,

  addUser,
  removeUser,

  socketToUserMap,
  userToSocketMap,

  getIo: () => io,
};
