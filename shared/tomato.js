const { TOMATO } = require("./constants");
const Vector = require("./vector");

class Tomato {
  constructor(data) {
    this.pos = data.pos;
    this.dir = data.dir;
    this.ownerId = data.ownerId;
  }

  update() {
    this.pos = Vector.applyDelta(this.pos, Vector.scale(TOMATO.VEL, this.dir));
  }
}

module.exports = Tomato;
