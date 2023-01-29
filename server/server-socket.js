const GameState = require("../shared/gameState");
const { GAME } = require("../shared/constants");

const User = require("./models/user");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

let game = new GameState();

const UPDATES_PER_SEC = 10;

const startGame = () => {
  setInterval(() => {
    for (const id in userToSocketMap) {
      // make updating less stable for testing
      // if (Math.random() < 1 / 60) {
      userToSocketMap[id].emit("update", {
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

const addUser = (user, channel) => {
  const oldChannel = userToSocketMap[user._id];
  if (oldChannel && oldChannel.id !== channel.id) {
    oldChannel.disconnect();
    delete socketToUserMap[oldChannel.id];
  }

  userToSocketMap[user._id] = channel;
  socketToUserMap[channel.id] = user;

  console.log(`${user._id} joined`);

  game.spawnPlayer(user._id);
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];

  if (user) game.disconnectPlayer(user._id);
};

const initGeckos = async (port) => {
  const geckos = await import("@geckos.io/server");
  io = geckos.geckos({ port });
  io.listen();

  io.onConnection((channel) => {
    console.log(`channel has connected ${channel.id}`);

    channel.onDisconnect(() => {
      const user = socketToUserMap[channel.id];
      console.log(`channel has disconnected ${channel.id}`);
      if (user) removeUser(user, channel);
    });

    channel.on("ping", () => {
      channel.emit("pong");
    });

    channel.on("arrowDown", (arrowCode) => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.setArrow(user._id, arrowCode, true);
      }
    });

    channel.on("arrowUp", (arrowCode) => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.setArrow(user._id, arrowCode, false);
      }
    });

    channel.on("mouseDown", () => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.setMouse(user._id, true);
      }
    });

    channel.on("mouseUp", () => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.setMouse(user._id, false);
      }
    });

    channel.on("mouseMove", (mousePos) => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.moveMouse(user._id, mousePos);
      }
    });
  });
};

module.exports = {
  init: initGeckos,

  addUser: addUser,
  removeUser: removeUser,

  socketToUserMap,
  userToSocketMap,

  getIo: () => io,
};
