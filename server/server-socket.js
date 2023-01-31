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

const startGame = (user, map) => {
  if (!(user in userToRoomMap)) return;

  const room = rooms[userToRoomMap[user]];
  if (room.players[0] != user) return;

  room.inGame = true;
  io.emit("updaterooms", rooms);

  const game = new GameState({ map });
  for (const user of room.players) {
    userToGameMap[user] = game;
    userToSocketMap[user].emit("startgame");
    game.spawnEgg(user);
  }

  const sendLoop = setInterval(() => {
    for (const user of room.players) {
      userToSocketMap[user].emit("update", {
        gameState: game,
        playerId: user,
      });
    }
  }, 1000 / UPDATES_PER_SEC);

  const updateLoop = setInterval(() => {
    game.update();

    // game over
    if (game.eggs.length <= 1) {
      // let game play out a bit before ending
      setTimeout(() => {
        room.inGame = false;
        io.emit("updaterooms", rooms);

        for (const user of room.players) {
          userToSocketMap[user].emit("gameover", game.eggs[0]?.id);
          delete userToGameMap[user];
        }

        clearInterval(sendLoop);
      }, 2000);
      clearInterval(updateLoop);
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
  if (user in userToRoomMap) return;
  const roomCode = getRandomCode();
  rooms[roomCode] = { roomCode, inGame: false, players: [] };
  joinRoom(user, roomCode);
};

const joinRoom = (user, roomCode) => {
  if (user in userToRoomMap) return;
  if (roomCode in rooms) {
    rooms[roomCode].players.push(user);
    userToRoomMap[user] = roomCode;
    io.emit("updaterooms", rooms);
  }
};

const leaveRoom = (user) => {
  if (user in userToRoomMap) {
    const players = rooms[userToRoomMap[user]].players;
    players.splice(players.indexOf(user), 1);

    if (players.length == 0) {
      delete rooms[userToRoomMap[user]];
    }

    if (user in userToGameMap) {
      userToGameMap[user].disconnectEgg(user);
      delete userToGameMap[user];
    }

    delete userToRoomMap[user];
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
      if (user) removeUser(user, socket);
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
        createRoom(user._id);
        socket.emit("updateroom", userToRoomMap[user._id]);
      }
    });

    socket.on("joinroom", (roomCode) => {
      const user = socketToUserMap[socket.id];
      if (user) {
        joinRoom(user._id, roomCode);
        socket.emit("updateroom", roomCode);
      }
    });

    socket.on("leaveroom", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        leaveRoom(user._id);
        socket.emit("updateroom", undefined);
      }
    });

    socket.on("startgame", (map) => {
      const user = socketToUserMap[socket.id];
      if (user) {
        startGame(user._id, map);
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
