const { Vector } = require("./utilities");

const FRAMES_PER_SEC = 60;

const MAP_SIZE = 1280;
const WHITE_SIZE = 960;
const YOLK_SIZE = 32;
const SCREEN_SIZE = 640;

const WHITE_ACCELERATION = 1000;
const YOLK_ACCELERATION = 5000;
const FRICTION = 0.95;

const SELF_SPRING = 1000;
const YOLK_YOLK_SPRING = 2000;
const YOLK_WHITE_SPRING = 200;
const WHITE_WHITE_SPRING = 20;
const MAP_SPRING = 10;

class Egg {
  constructor(id) {
    this.id = id;

    const startX = Math.random() * MAP_SIZE;
    const startY = Math.random() * MAP_SIZE;

    this.whitePos = new Vector(startX, startY);
    this.whiteVel = new Vector(0, 0);
    this.whiteAcc = new Vector(0, 0);

    this.whiteSize = WHITE_SIZE;

    this.yolkPos = new Vector(startX, startY);
    this.yolkVel = new Vector(0, 0);
    this.yolkAcc = new Vector(0, 0);

    this.ptrPos = new Vector(startX, startY);
    this.ptrClicked = false;

    this.screenPos = new Vector(
      startX - SCREEN_SIZE / 2,
      startY + SCREEN_SIZE / 2
    );

    this.collisions = [];
  }

  movePtr(pos) {
    this.ptrPos = pos.add(this.screenPos);
  }

  moveWhite(dir) {
    this.whiteAcc.add(Vector.scalarProd(WHITE_ACCELERATION, dir));
  }

  updatePosition() {
    // handle white physics
    this.whiteMapCollision();
    this.whiteVel.add(Vector.scalarProd(1 / FRAMES_PER_SEC, this.whiteAcc));
    this.whiteVel.scale(FRICTION);
    this.whitePos.add(Vector.scalarProd(1 / FRAMES_PER_SEC, this.whiteVel));

    // if clicked, pull yolk forwards
    let yolkAcc = new Vector(0, 0);
    if (this.ptrClicked) {
      yolkAcc = Vector.diff(this.ptrPos, this.yolkPos);
      yolkAcc.scale(YOLK_ACCELERATION / yolkAcc.norm());
    }

    // spring to pull back yolk
    const yolkDist = Vector.diff(this.yolkPos, this.whitePos);
    yolkAcc.add(yolkDist.scale(-SELF_SPRING / FRAMES_PER_SEC));

    // handle yolk physics
    this.yolkVel.add(Vector.scalarProd(1 / FRAMES_PER_SEC, yolkAcc));
    this.yolkVel.scale(FRICTION);
    this.yolkPos.add(Vector.scalarProd(1 / FRAMES_PER_SEC, this.yolkVel));

    this.ptrPos.add(Vector.scalarProd(1 / FRAMES_PER_SEC, this.whiteVel));

    this.screenPos.x = this.whitePos.x - SCREEN_SIZE / 2;
    this.screenPos.y = this.whitePos.y + SCREEN_SIZE / 2;
  }

  whiteMapCollision() {
    if (this.whitePos.x < this.whiteSize / 10) {
      this.whiteVel.x +=
        (-MAP_SPRING * (this.whitePos.x - this.whiteSize / 10)) /
        FRAMES_PER_SEC;
    }
    if (MAP_SIZE - this.whitePos.x < this.whiteSize / 10) {
      this.whiteVel.x +=
        (MAP_SPRING * (MAP_SIZE - this.whitePos.x - this.whiteSize / 10)) /
        FRAMES_PER_SEC;
    }
    if (this.whitePos.y < this.whiteSize / 10) {
      this.whiteVel.y +=
        (-MAP_SPRING * (this.whitePos.y - this.whiteSize / 10)) /
        FRAMES_PER_SEC;
    }
    if (MAP_SIZE - this.whitePos.y < this.whiteSize / 10) {
      this.whiteVel.y +=
        (MAP_SPRING * (MAP_SIZE - this.whitePos.y - this.whiteSize / 10)) /
        FRAMES_PER_SEC;
    }
  }

  static yolkYolkCollision = (a, b) => {
    if (a.yolkPos.dist(b.yolkPos) < 2 * YOLK_SIZE) {
      const normal = Vector.diff(b.yolkPos, a.yolkPos);
      normal.scale(
        (-YOLK_YOLK_SPRING * ((2 * YOLK_SIZE) / normal.norm() - 1)) /
          FRAMES_PER_SEC
      );
      a.yolkVel.add(normal);
    }
  };

  static yolkWhiteCollision = (a, b) => {
    if (a.yolkPos.dist(b.whitePos) < b.whiteSize / 10) {
      const normal = Vector.diff(b.whitePos, a.yolkPos);
      normal.scale(
        (-YOLK_WHITE_SPRING * (b.whiteSize / 10 / normal.norm() - 1)) /
          FRAMES_PER_SEC
      );
      a.yolkVel.add(normal);

      b.whiteSize -= 1;
      //a.whiteSize += 1;
    }
  };

  static whiteWhiteCollision = (a, b) => {
    const diameter = (a.whiteSize + b.whiteSize) / 10;
    if (a.whitePos.dist(b.whitePos) < diameter) {
      const normal = Vector.diff(b.whitePos, a.whitePos);
      normal.scale(
        (-WHITE_WHITE_SPRING * (diameter / normal.norm() - 1)) / FRAMES_PER_SEC
      );
      a.whiteVel.add(normal);
    }
  };
}

module.exports = Egg;
