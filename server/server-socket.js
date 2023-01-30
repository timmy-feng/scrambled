const GameState = require("../shared/gameState");
const { GAME } = require("../shared/constants");
const Vector = require("../shared/vector");

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

  game.spawnEgg(user._id);
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];

  if (user) game.disconnectEgg(user._id);
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

    channel.on("input", (input) => {
      const user = socketToUserMap[channel.id];
      if (user) {
        game.handleInput(user._id, input);
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
