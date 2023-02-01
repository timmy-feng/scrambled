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
  TOMATO,
} = require("./constants");
const Gummy = require("./gummy");
const Tomato = require("./tomato");

const getSpringAcc = (v, w, radius, springConst) => {
  const displ = Vector.diff(v, w);
  if (displ.norm() >= radius) return new Vector();

  const magnitude = springConst * (radius - displ.norm());
  return Vector.scale(magnitude, displ.unit());
};

class GameState {
  constructor(data = {}) {
    this.map = data.map;

    this.eggs = data.eggs ? data.eggs.map((egg) => new Egg(egg)) : [];
    this.gummies = data.gummies
      ? data.gummies.map((gummy) => new Gummy(gummy))
      : [];
    this.tomatoes = data.tomatoes
      ? data.tomatoes.map((tomato) => new Tomato(tomato))
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

  updateTomatoes() {
    const exploded = [];
    for (const tomato of this.tomatoes) {
      tomato.update();

      for (const egg of this.eggs) {
        if (Vector.dist(tomato.pos, egg.whitePos) < egg.whiteSize / 10) {
          if (tomato.ownerId != egg.id) {
            exploded.push(tomato);
            egg.damage(TOMATO.DAMAGE, tomato.ownerId);
            break;
          }
        }
      }

      if (
        tomato.pos.x < 0 ||
        tomato.pos.x > GAME.MAP_SIZE ||
        tomato.pos.y < 0 ||
        tomato.pos.y > GAME.MAP_SIZE
      ) {
        exploded.push(tomato);
      }
    }

    for (const tomato of exploded) {
      this.tomatoes.splice(this.tomatoes.indexOf(tomato), 1);
    }
  }

  updateGummies(updates) {
    for (const egg of this.eggs) {
      // try to eat gummies
      const eaten = [];
      for (const gummy of this.gummies) {
        if (
          gummy.type == "seaweed" ||
          !("frozen" in egg.state || "sprung" in egg.state)
        ) {
          if (Vector.dist(egg.yolkPos, gummy.pos) < GUMMY.SIZE) {
            eaten.push(gummy);
            updates.push({
              id: egg.id,
              type: gummy.type,
            });
          }
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

  updateDead(updates) {
    const dead = [];
    for (const egg of this.eggs) {
      if (egg.whiteSize < WHITE.MIN_SIZE) {
        dead.push(egg.id);
        updates.push({
          id: egg.killerId,
          type: "kill",
        });
      }
    }

    for (const id of dead) {
      this.eggs.splice(this.indexOfEgg(id), 1);
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

      if ("fishcake" in you.state) {
        const dir = Vector.diff(me.whitePos, you.whitePos).unit();
        me.state.sprung = GUMMY.fishcake.SPRUNG;
        me.yolkVel = Vector.scale(GUMMY.fishcake.VEL, dir);
        delete you.state.spring;
      }

      if ("garlic" in you.state) {
        me.state.frozen = GUMMY.garlic.FROZEN;
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
        you.damage(BITE.SIZE, me.id);
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

  update() {
    const updates = [];

    this.updatePairCollisions();

    for (const egg of this.eggs) egg.update();

    this.updateTomatoes();

    this.updateGummies(updates);

    this.updateDead(updates);

    this.framesPassed += 1;
    return updates;
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
    if (this.isGameOver()) return;

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
      if (
        "tomato" in egg.state &&
        egg.state.tomato < GUMMY.tomato.DURATION - GUMMY.tomato.BUFFER
      ) {
        console.log(Vector.diff(egg.pointerPos, egg.yolkPos).unit());
        this.tomatoes.push(
          new Tomato({
            pos: egg.yolkPos,
            dir: Vector.diff(egg.pointerPos, egg.yolkPos).unit(),
            ownerId: egg.id,
          })
        );
        delete egg.state.tomato;
      }
    } else if (input.type == "pointerUp") {
      egg.setPointerDown(false);
    } else if (input.type == "joystick") {
      egg.setWhiteDir(input.dir);
    }
  }

  isGameOver() {
    // return this.framesPassed < 20 * 60;
    return this.eggs.length <= 1;
  }

  // TODO: make a way to get "random" positions that are far from other objects
  getRandomPos() {
    return Vector.sum(
      Vector.polar(
        (Math.random() * GAME.MAP_SIZE) / 2,
        Math.random() * 2 * Math.PI
      ),
      new Vector(GAME.MAP_SIZE / 2, GAME.MAP_SIZE / 2)
    );
  }

  getRandomFace() {
    return FACES[Math.floor(Math.random() * FACES.length)];
  }

  getRandomGummy() {
    let rand = Math.random();

    for (const gummy in GUMMY[this.map]) {
      if (rand < GUMMY[this.map][gummy]) {
        return gummy;
      }
      rand -= GUMMY[this.map][gummy];
    }
  }
}

module.exports = GameState;
