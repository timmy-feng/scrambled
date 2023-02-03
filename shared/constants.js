const Vector = require("./vector");

const GAME = {
  MAP_SIZE: 1280,
  SCREEN_SIZE: 1280,
  FRAMES_PER_SEC: 60, // change in vector.js too
  MAX_PLAYERS: 2,
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
  SIZE: 96,
};

const SPRING = {
  SELF: 33,
  YOLK_YOLK: 50,
  YOLK_WHITE: 300,
  WHITE_WHITE: 20,
  MAP: 20,
  MAP_BUFFER: 128,
};

const BITE = {
  INTERVAL: 20,
  SIZE: 150,
};

const GUMMY = {
  COUNT: 8,
  SIZE: 64,
  scallion: {
    SIZE_INC: 50,
    DURATION: 0,
  },
  fishcake: {
    SIZE_INC: 50,
    DURATION: 60,
    VEL: 5000,
    SPRUNG: 60,
  },
  garlic: {
    SIZE_INC: 50,
    DURATION: 120,
    FROZEN: 120,
  },
  pepper: {
    SIZE_INC: 50,
    DURATION: 300,
  },
  sarah: {
    SIZE_INC: 50,
    DURATION: 300,
  },
  tomato: {
    SIZE_INC: 50,
    DURATION: 120,
    BUFFER: 10,
  },
  seaweed: {
    SIZE_INC: 50,
    DURATION: 120,
  },

  // maps
  practice: {
    scallion: 1,
  },
  rice: {
    pepper: 0.05,
    garlic: 0.15,
    scallion: 0.8,
  },
  ramen: {
    seaweed: 0.2,
    fishcake: 0.3,
    scallion: 0.5,
  },
  shakshuka: {
    sarah: 0.1,
    garlic: 0.3,
    tomato: 0.6,
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
  TOMATO,
};
