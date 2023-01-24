const game = require("./game/game");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const FRAMES_PER_SEC = 60;

const startGame = () => {
  setInterval(() => {
    game.updateGameState();
    for (const id in userToSocketMap) {
      getSocketFromUserID(id).emit("update", {
        ...game.gameState,
        you: game.gameState.players[id],
      });
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

  game.killPlayer(user._id);
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

      socket.on("move", (dir) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.movePlayer(user._id, dir);
        }
      });

      socket.on("ptr", (pos) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.movePtr(user._id, pos);
        }
      });

      socket.on("click", (clicked) => {
        const user = getUserFromSocketID(socket.id);
        if (user) {
          game.setClick(user._id, clicked);
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
