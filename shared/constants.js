const Vector = require("./vector");

const GAME = {
  MAP_SIZE: 960,
  SCREEN_SIZE: 640,
  FRAMES_PER_SEC: 60,
};

const WHITE = {
  ACCELERATION: 2500,
  FRICTION: 0.9,
  INIT_SIZE: 900,
  MAX_SIZE: 1500,
  MIN_SIZE: 600,
};

const YOLK = {
  ACCELERATION: 1000,
  FRICTION: 0.9,
  SIZE: 48,
};

const SPRING = {
  SELF: 2000,
  YOLK_YOLK: 50,
  YOLK_WHITE: 500,
  WHITE_WHITE: 20,
  MAP: 20,
};

const BITE = {
  INTERVAL: 20,
  SIZE: 150,
};

const GUMMY = {
  COUNT: 4,
  SIZE: 64,
  BOOST: 50,
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
