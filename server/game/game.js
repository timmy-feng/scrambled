const Egg = require("./egg");
const { Vector } = require("./utilities");

const User = require("../models/user.js");

const GUMMY_COUNT = 16;
const MAP_SIZE = 1280;

const KILL_SIZE = 640;

const gameState = {
  players: {},
  gummies: [],
};

const updateGameState = () => {
  while (gameState.gummies.length < GUMMY_COUNT) {
    gameState.gummies.push(
      new Vector(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE)
    );
  }

  for (const player of Object.values(gameState.players)) {
    player.updatePosition();
  }

  // have yolks eat whites
  for (const yolk of Object.values(gameState.players)) {
    for (const white of Object.values(gameState.players)) {
      if (yolk.id != white.id) Egg.yolkWhiteCollision(yolk, white);
    }
  }

  // handling collisions of yolks:
  for (const yolk1 of Object.values(gameState.players)) {
    for (const yolk2 of Object.values(gameState.players)) {
      if (yolk1.id != yolk2.id) Egg.yolkYolkCollision(yolk1, yolk2);
    }
  }

  // handling collisions of whites:
  for (const white1 of Object.values(gameState.players)) {
    for (const white2 of Object.values(gameState.players)) {
      if (white1.id != white2.id) Egg.whiteWhiteCollision(white1, white2);
    }
  }

  // check for death
  for (const id in gameState.players) {
    if (gameState.players[id].whiteSize <= KILL_SIZE) {
      delete gameState.players[id];
      User.updateOne({ _id: id }, { $inc: { numDeaths: 1 } }).then(
        (numMat, numMod) => {
          console.log(`found ${numMat} documents and modified ${numMod}`);
        }
      );
    }
  }
};

const spawnPlayer = (id) => {
  gameState.players[id] = new Egg(id);
};

const killPlayer = (id) => {
  delete gameState.players[id];
};

const movePlayer = (id, dir) => {
  if (!gameState.players[id]) return;
  gameState.players[id].moveWhite(new Vector(dir.x, dir.y));
};

const movePtr = (id, pos) => {
  if (!gameState.players[id]) return;
  gameState.players[id].movePtr(new Vector(pos.x, pos.y));
};

const setClick = (id, clicked) => {
  if (!gameState.players[id]) return;
  gameState.players[id].ptrClicked = clicked;
};

module.exports = {
  gameState,
  updateGameState,
  spawnPlayer,
  killPlayer,
  movePlayer,
  movePtr,
  setClick,
};
