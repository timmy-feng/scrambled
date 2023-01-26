const Vector = require("./vector");

const GAME = {
  MAP_SIZE: 1280,
  SCREEN_SIZE: 640,
  KILL_SIZE: 640,
  FRAMES_PER_SEC: 60,
};

const WHITE = {
  ACCELERATION: 1000,
  FRICTION: 0.9,
  SIZE: 960,
};

const YOLK = {
  ACCELERATION: 1000,
  FRICTION: 0.9,
  SIZE: 48,
};

const SPRING = {
  SELF: 2000,
  YOLK_YOLK: 50,
  YOLK_WHITE: 50,
  WHITE_WHITE: 20,
  MAP: 20,
};

const BITE = {
  INTERVAL: 20,
  SIZE: 40,
};

const GUMMY = {
  COUNT: 8,
  SIZE: 64,
  BOOST: 20,
};

const FACES = ["( ͡° ͜ʖ ͡°)", "UwU", "◕‿↼", "( ͡° ᴥ ͡°)", "(ツ)", "(-_-)"];

const ARROW_CODE = {
  ArrowUp: 0,
  w: 0,
  W: 0,
  ArrowDown: 1,
  s: 1,
  S: 1,
  ArrowRight: 2,
  d: 2,
  D: 2,
  ArrowLeft: 3,
  a: 3,
  A: 3,
};

const DIRECTION = [
  new Vector(0, 1),
  new Vector(0, -1),
  new Vector(1, 0),
  new Vector(-1, 0),
];

module.exports = {
  GAME,
  WHITE,
  YOLK,
  SPRING,
  BITE,
  GUMMY,
  FACES,
  ARROW_CODE,
  DIRECTION,
};
