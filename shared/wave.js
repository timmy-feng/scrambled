const { GAME } = require("./constants");
const Vector = require("./vector");

class Wave {
  constructor(data) {
    this.pos = data.pos;
    this.dir = data.dir;
  }

  updatePosition() {
    this.pos = Vector.sum(
      this.pos,
      Vector.scale(1000 / GAME.FRAMES_PER_SEC, this.dir)
    );
  }

  inBounds() {
    return (
      -GAME.MAP_SIZE < this.pos.x &&
      this.pox.x < 2 * GAME.MAP_SIZE &&
      -GAME.MAP_SIZE < this.pos.y &&
      this.pos.y < 2 * GAME.MAP_SIZE
    );
  }
}

module.exports = Wave;
