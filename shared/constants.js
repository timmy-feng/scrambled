const Vector = require("./vector");

const GAME = {
  MAP_SIZE: 960,
  SCREEN_SIZE: 1280,
  FRAMES_PER_SEC: 60, // change in vector.js too
};

const WHITE = {
  ACC: 2500,
  FRICTION: 0.9,
  INIT_SIZE: 900,
  MAX_SIZE: 1500,
  MIN_SIZE: 600,
};

const YOLK = {
  MAX_ACC: 15000,
  ACC: 1000,
  FRICTION: 0.9,
  SIZE: 48,
};

const TOMATO = {
  VEL: 1000,
  DAMAGE: 150,
  SIZE: 32,
};

const SPRING = {
  SELF: 33,
  YOLK_YOLK: 50,
  YOLK_WHITE: 300,
  WHITE_WHITE: 20,
  MAP: 20,
};

const BITE = {
  INTERVAL: 20,
  SIZE: 150,
};

const GUMMY = {
  COUNT: 8,
  SIZE: 64,
  gummy: {
    SIZE_INC: 50,
    DURATION: 0,
  },
  spring: {
    SIZE_INC: 50,
    DURATION: 60,
  },
  freeze: {
    SIZE_INC: 50,
    DURATION: 120,
  },
  speed: {
    SIZE_INC: 50,
    DURATION: 300,
  },
  invisible: {
    SIZE_INC: 50,
    DURATION: 300,
  },
  armed: {
    SIZE_INC: 50,
    DURATION: 120,
    BUFFER: 10,
  },
};

const MISC = {
  FROZEN: {
    DURATION: 120,
  },
  SPRUNG: {
    DURATION: 120,
    VEL: 5000,
  },
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

const DIR = [
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
  DIR,
  MISC,
  TOMATO,
};
