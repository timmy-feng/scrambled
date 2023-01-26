const Vector = require("../shared/vector");
const GameState = require("../shared/gameState");
const User = require("./models/user");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const FRAMES_PER_SEC = 60;

let game = new GameState();

const startGame = () => {
  setInterval(() => {
    for (const deadId in game.update()) {
      User.updateOne({ _id: deadId }, { $inc: { numDeaths: 1 } });
    }

    for (const id in userToSocketMap) {
      // make updating less stable for testing
      // if (Math.random() < 1 / 60) {
      getSocketFromUserID(id).emit("update", {
        gameState: game,
        playerId: id,
      });
      // }
    }
  }, 1000 / FRAMES_PER_SEC);
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

  game.spawnPlayer(user._id);
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];

  game.disconnectPlayer(user._id);
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);

      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        if (!user) return; // not sure why I had to add this line, but it works now
        console.log(`Disconnected ${user._id}`);
        removeUser(user, socket);
      });

      socket.on("pingTest", (timeSent) => {
        socket.emit("pingResult", Date.now() - timeSent);
      });

      // socket api below

      const direction = [
        new Vector(0, 1),
        new Vector(0, -1),
        new Vector(1, 0),
        new Vector(-1, 0),
      ];

      socket.on("arrowDown", (arrowCode) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.moveWhite(user._id, direction[arrowCode]);
        }
      });

      socket.on("arrowUp", (arrowCode) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.moveWhite(user._id, Vector.scale(-1, direction[arrowCode]));
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
