const Egg = require("./egg");
const Vector = require("./vector");
const {
  GUMMY,
  GAME,
  WHITE,
  FACES,
  YOLK,
  SPRING,
  BITE,
  MISC,
} = require("./constants");
const Gummy = require("./gummy");

const getSpringAcc = (v, w, radius, springConst) => {
  const displ = Vector.diff(v, w);
  if (displ.norm() >= radius) return new Vector();

  const magnitude = springConst * (radius - displ.norm());
  return Vector.scale(magnitude, displ.unit());
};

class GameState {
  constructor(data = {}) {
    this.eggs = data.eggs ? data.eggs.map((egg) => new Egg(egg)) : [];
    this.gummies = data.gummies
      ? data.gummies.map((gummy) => new Gummy(gummy))
      : [];
    this.collisions = data.collisions ? data.collisions : {};
    this.predictMode = data.predictMode ?? false;
    this.framesPassed = data.framesPassed ?? 0;
  }

  updatePairCollisions() {
    for (const a of this.eggs) {
      for (const b of this.eggs) {
        if (a.id != b.id) {
          this.yolkWhiteCollision(a, b);
          this.yolkYolkCollision(a, b);
          this.whiteWhiteCollision(a, b);
        }
      }
    }
  }

  updateGummies() {
    for (const egg of this.eggs) {
      // try to eat gummies
      if (!("frozen" in egg.state || "sprung" in egg.state)) {
        const eaten = [];
        for (const gummy of this.gummies) {
          if (Vector.dist(egg.yolkPos, gummy.pos) < GUMMY.SIZE) {
            eaten.push(gummy);
          }
        }

        for (const gummy of eaten) {
          egg.whiteSize += GUMMY[gummy.type].SIZE_INC;
          egg.state[gummy.type] = GUMMY[gummy.type].DURATION;
          this.gummies.splice(this.gummies.indexOf(gummy), 1);
        }

        egg.whiteSize = Math.min(WHITE.MAX_SIZE, egg.whiteSize);
        egg.playAy += eaten.length;
      }
    }

    // respawn gummies to max number unless in predict mode
    // if we're in predict mode, we don't want to misplace random gummies
    if (!this.predictMode) {
      while (this.gummies.length < GUMMY.COUNT) {
        this.gummies.push(
          new Gummy({
            type: this.getRandomGummy(),
            pos: this.getRandomPos(),
          })
        );
      }
    }
  }

  yolkYolkCollision(me, you) {
    const acc = getSpringAcc(
      me.yolkPos,
      you.yolkPos,
      2 * YOLK.SIZE,
      SPRING.YOLK_YOLK
    );
    if (acc.norm() != 0) {
      me.yolkVel = Vector.applyDelta(me.yolkVel, acc);

      if ("spring" in you.state) {
        const dir = Vector.diff(me.whitePos, you.whitePos).unit();
        me.state.sprung = MISC.SPRING.DURATION;
        me.yolkVel = Vector.scale(MISC.SPRUNG.VEL, dir);
        delete you.state.spring;
      }

      if ("freeze" in you.state) {
        me.state.frozen = MISC.FROZEN.DURATION;
        delete you.state.freeze;
      }
    }
  }

  yolkWhiteCollision = (me, you) => {
    const acc = getSpringAcc(
      me.yolkPos,
      you.whitePos,
      you.whiteSize / 10,
      SPRING.YOLK_WHITE
    );

    if (acc.norm() != 0) {
      me.yolkVel = Vector.applyDelta(me.yolkVel, acc);
    }

    const collisionId = me.id + "." + you.id;
    if (acc.norm() != 0 && !("frozen" in me.state || "sprung" in me.state)) {
      if (!this.collisions[collisionId]) {
        this.collisions[collisionId] = 0;
      }

      this.collisions[collisionId] += 1;
      // only after being in contact for BITE_INTERVAL time will a bite be taken
      if (this.collisions[collisionId] == BITE.INTERVAL) {
        you.whiteSize -= BITE.SIZE;
        delete this.collisions[collisionId];
      }
    } else {
      delete this.collisions[collisionId];
    }
  };

  whiteWhiteCollision = (me, you) => {
    const acc = getSpringAcc(
      me.whitePos,
      you.whitePos,
      (me.whiteSize + you.whiteSize) / 10,
      SPRING.WHITE_WHITE
    );
    me.whiteVel = Vector.applyDelta(me.whiteVel, acc);
  };

  // returns list of ids of eggs that just died (for now)
  update() {
    this.updatePairCollisions();

    for (const egg of this.eggs) {
      egg.update();
    }

    this.updateGummies();

    const dead = [];
    for (const egg of this.eggs) {
      if (egg.whiteSize < WHITE.MIN_SIZE) {
        dead.push(egg.id);
      }
    }

    for (const id of dead) {
      this.eggs.splice(this.indexOfEgg(id), 1);
    }

    this.framesPassed += 1;
    return dead;
  }

  indexOfEgg(id) {
    return this.eggs.findIndex((egg) => egg.id == id);
  }

  getEggById(id) {
    const i = this.indexOfEgg(id);
    return i == -1 ? null : this.eggs[i];
  }

  spawnEgg(id) {
    this.eggs.push(
      new Egg({ id, name: this.getRandomFace(), whitePos: this.getRandomPos() })
    );
  }

  disconnectEgg(id) {
    const i = this.indexOfEgg(id);
    if (i != -1) this.eggs.splice(i, 1);
  }

  handleInput(id, input) {
    const egg = this.getEggById(id);
    if (!egg) return;

    if (input.type == "arrowDown") {
      egg.setArrowDown(input.key, true);
    } else if (input.type == "arrowUp") {
      egg.setArrowDown(input.key, false);
    } else if (input.type == "pointerMove") {
      egg.setPointerPos(input.pos);
    } else if (input.type == "pointerDown") {
      egg.setPointerDown(true);
    } else if (input.type == "pointerUp") {
      egg.setPointerDown(false);
    } else if (input.type == "joystick") {
      egg.setWhiteDir(input.dir);
    }
  }

  // TODO: make a way to get "random" positions that are far from other objects
  getRandomPos() {
    return new Vector(
      Math.random() * GAME.MAP_SIZE,
      Math.random() * GAME.MAP_SIZE
    );
  }

  getRandomFace() {
    return FACES[Math.floor(Math.random() * FACES.length)];
  }

  getRandomGummy() {
    const rand = Math.random();
    if (rand < 0.05) {
      return "speed";
    } else if (rand < 0.2) {
      return "freeze";
    } else {
      return "gummy";
    }
  }
}

module.exports = GameState;
