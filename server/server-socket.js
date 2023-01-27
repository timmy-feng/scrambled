const GameState = require("../shared/gameState");
const { GAME } = require("../shared/constants");

const User = require("./models/user");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

let game = new GameState();

const UPDATES_PER_SEC = 60;

const startGame = () => {
  setInterval(() => {
    for (const id in userToSocketMap) {
      // make updating less stable for testing
      // if (Math.random() < 1 / 60) {
      getSocketFromUserID(id).emit("update", {
        gameState: game,
        playerId: id,
      });
      // }
    }
  }, 1000 / UPDATES_PER_SEC);

  setInterval(() => {
    for (const deadId of game.update()) {
      User.updateOne({ _id: deadId }, { $inc: { numDeaths: 1 } });
    }
  }, 1000 / GAME.FRAMES_PER_SEC);
};

startGame();

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;

  console.log(`${user._id} joined`);

  game.spawnPlayer(user._id);
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];

  game.disconnectPlayer(user._id);
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http, { pingInterval: 1000 });

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);

      // this code generates fake latency
      // socket.use((socket, next) => {
      //   setTimeout(() => next(), Math.random() * 300);
      // });

      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        console.log(`Disconnected ${user._id}`);
        removeUser(user, socket);
      });

      // socket api below

      socket.on("arrowDown", (arrowCode) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.setArrow(user._id, arrowCode, true);
        }
      });

      socket.on("arrowUp", (arrowCode) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.setArrow(user._id, arrowCode, false);
        }
      });

      // socket.on("spacebarDown", () => {
      //   const user = getUserFromSocketID(socket.id);
      //   if (user) {
      //     game.setMode(user._id, true);
      //   }
      // });

      // socket.on("spacebarUp", () => {
      //   const user = getUserFromSocketID(socket.id);
      //   if (user) {
      //     game.setMode(user._id, false);
      //   }
      // });

      socket.on("mouseDown", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.setMouse(user._id, true);
        }
      });

      socket.on("mouseUp", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.setMouse(user._id, false);
        }
      });

      socket.on("mouseMove", (mousePos) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.moveMouse(user._id, mousePos);
        }
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
