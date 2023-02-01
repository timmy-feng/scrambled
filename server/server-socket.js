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

  const room = rooms[userToRoomMap[user._id]];
  if (room.inGame || room.players[0] != user) return;

  room.inGame = true;
  io.emit("updaterooms", rooms);

  const game = new GameState({ map });
  for (const user of room.players) {
    delete results[user._id];
    results[user._id] = { user, stats: {} };

    userToGameMap[user._id] = game;
    userToSocketMap[user._id].emit("startgame");
    game.spawnEgg(user._id);
  }

  const sendLoop = setInterval(() => {
    for (const user of room.players) {
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
        for (const user of room.players) {
          if (user._id in results) {
            results[user._id].won = user._id == game.eggs[0].id;

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

        room.inGame = false;
        io.emit("updaterooms", rooms);

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
  rooms[roomCode] = { roomCode, inGame: false, players: [] };
  joinRoom(user, roomCode);
};

const joinRoom = (user, roomCode) => {
  if (user._id in userToRoomMap) return;
  if (roomCode in rooms) {
    rooms[roomCode].players.push(user);
    userToRoomMap[user._id] = roomCode;
    io.emit("updaterooms", rooms);
  }
};

const leaveRoom = (user) => {
  if (user._id in userToRoomMap) {
    const players = rooms[userToRoomMap[user._id]].players;
    players.splice(players.indexOf(user), 1);

    if (players.length == 0) {
      delete rooms[userToRoomMap[user._id]];
    }

    if (user._id in userToGameMap) {
      userToGameMap[user._id].disconnectEgg(user._id);
      delete userToGameMap[user._id];
    }

    delete userToRoomMap[user._id];
    io.emit("updaterooms", rooms);
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
  }
  delete socketToUserMap[socket.id];
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
