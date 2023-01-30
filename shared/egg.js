const Vector = require("./vector");
const { GAME, WHITE, YOLK, SPRING, DIR } = require("./constants");

class Egg {
  // requires data.id
  constructor(data) {
    this.id = data.id;
    this.name = data.name;

    this.whitePos = data.whitePos;
    this.whiteVel = data.whiteVel ?? new Vector();
    this.whiteDir = data.whiteDir ?? new Vector();

    this.yolkPos = data.yolkPos ?? this.whitePos;
    this.yolkVel = data.yolkVel ?? new Vector();

    this.whiteSize = data.whiteSize ?? WHITE.INIT_SIZE;
    this.state = data.state ?? {};

    this.pointerPos = data.pointerPos ?? this.whitePos;
    this.pointerDown = data.pointerDown ?? false;
    this.arrowDown = data.arrowDown ?? [false, false, false, false];

    // let's try this again LOL
    this.playAy = data.playAy ?? 0;
  }

  setPointerPos(pointerPos) {
    this.pointerPos = pointerPos;
  }

  setPointerDown(pointerDown) {
    this.pointerDown = pointerDown;
  }

  setArrowDown(key, keyDown) {
    this.arrowDown[key] = keyDown;

    // recalculate whiteDir based on arrow keys
    this.whiteDir = new Vector();
    for (let i = 0; i < 4; i++) {
      if (this.arrowDown[i]) {
        this.whiteDir = Vector.sum(this.whiteDir, DIR[i]);
      }
    }
    this.whiteDir = this.whiteDir.unit();
  }

  setWhiteDir(whiteDir) {
    this.whiteDir = whiteDir;
  }

  // TODO: Make bigger eggs move slower
  getWhiteAcc() {
    let whiteAcc = Vector.scale(WHITE.ACC, this.whiteDir);
    if (!this.yolkInWhite()) whiteAcc = Vector.scale(0.75, whiteAcc);
    if ("sprung" in this.state) whiteAcc = Vector.scale(0.75, whiteAcc);
    if ("frozen" in this.state) whiteAcc = Vector.scale(0.75, whiteAcc);
    return whiteAcc;
  }

  updateWhite() {
    this.handleMapCollision();

    this.whiteVel = Vector.applyDelta(this.whiteVel, this.getWhiteAcc());
    this.whiteVel = Vector.scale(WHITE.FRICTION, this.whiteVel);

    this.whitePos = Vector.applyDelta(this.whitePos, this.whiteVel);
  }

  getPointerAcc() {
    if (!this.pointerDown || "sprung" in this.state || "frozen" in this.state)
      return new Vector();

    const displ = Vector.diff(this.pointerPos, this.yolkPos);
    const magnitude = Math.min(
      YOLK.MAX_ACC,
      YOLK.ACC * Math.sqrt(displ.norm())
    );

    return Vector.scale(magnitude, displ.unit());
  }

  getYolkToWhiteAcc() {
    const displ = Vector.diff(this.whitePos, this.yolkPos);
    return Vector.scale(SPRING.SELF, displ);
  }

  updateYolk() {
    const yolkAcc = Vector.sum(this.getPointerAcc(), this.getYolkToWhiteAcc());

    this.yolkVel = Vector.applyDelta(this.yolkVel, yolkAcc);
    this.yolkVel = Vector.scale(YOLK.FRICTION, this.yolkVel);

    this.yolkPos = Vector.applyDelta(this.yolkPos, this.yolkVel);
  }

  updateState() {
    const expired = [];
    for (const status in this.state) {
      this.state[status] -= 1;
      if (this.state[status] <= 0) {
        expired.push(status);
      }
    }

    for (const status of expired) {
      delete this.state[status];
    }
  }

  update() {
    this.updateWhite();
    if (!("frozen" in this.state)) {
      this.updateYolk();
    }
    this.updateState();
  }

  yolkInWhite() {
    return Vector.dist(this.whitePos, this.yolkPos) < this.whiteSize / 10;
  }

  // TODO: refactor this code - vectors should be immutable
  handleMapCollision() {
    if (this.whitePos.x < this.whiteSize / 10) {
      this.whiteVel.x +=
        (-SPRING.MAP * (this.whitePos.x - this.whiteSize / 10)) /
        GAME.FRAMES_PER_SEC;
    }
    if (GAME.MAP_SIZE - this.whitePos.x < this.whiteSize / 10) {
      this.whiteVel.x +=
        (SPRING.MAP * (GAME.MAP_SIZE - this.whitePos.x - this.whiteSize / 10)) /
        GAME.FRAMES_PER_SEC;
    }
    if (this.whitePos.y < this.whiteSize / 10) {
      this.whiteVel.y +=
        (-SPRING.MAP * (this.whitePos.y - this.whiteSize / 10)) /
        GAME.FRAMES_PER_SEC;
    }
    if (GAME.MAP_SIZE - this.whitePos.y < this.whiteSize / 10) {
      this.whiteVel.y +=
        (SPRING.MAP * (GAME.MAP_SIZE - this.whitePos.y - this.whiteSize / 10)) /
        GAME.FRAMES_PER_SEC;
    }
  }
}

module.exports = Egg;
