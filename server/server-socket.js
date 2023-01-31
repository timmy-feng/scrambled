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

const startGame = (user) => {
  const room = rooms[userToRoomMap[user]];
  if (!room || room[0] != user) {
    return false;
  }

  const game = new GameState();
  for (const user of room) {
    userToGameMap[user] = game;
    userToSocketMap[user]?.emit("startgame");
    game.spawnEgg(user);
  }

  setInterval(() => {
    for (const user of room) {
      userToSocketMap[user]?.emit("update", {
        gameState: game,
        playerId: user,
      });
    }
  }, 1000 / UPDATES_PER_SEC);

  setInterval(() => {
    for (const dead of game.update()) {
      User.updateOne({ _id: dead }, { $inc: { numDeaths: 1 } });
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
  rooms[roomCode] = [];
  joinRoom(user, roomCode);
};

const joinRoom = (user, roomCode) => {
  if (user in userToRoomMap) return;
  if (roomCode in rooms) {
    rooms[roomCode].push(user);
    userToRoomMap[user] = roomCode;
    io.emit("updaterooms", rooms);
  }
};

const leaveRoom = (user) => {
  if (user in userToRoomMap) {
    const room = rooms[userToRoomMap[user]];
    room.splice(room.indexOf(user), 1);

    if (room.length == 0) {
      delete rooms[userToRoomMap[user]];
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

    if (user._id in userToGameMap) {
      userToGameMap[user._id].disconnectEgg(user._id);
      delete userToGameMap[user._id];
    }

    leaveRoom(user._id);
  }
  delete socketToUserMap[socket.id];
};

const initGeckos = async (port) => {
  const geckos = await import("@geckos.io/server");
  io = geckos.geckos({ port });
  io.listen();

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
      socket.emit("updaterooms", rooms);
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

    socket.on("startgame", () => {
      const user = socketToUserMap[socket.id];
      if (user) {
        startGame(user._id);
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
