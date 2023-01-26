const Vector = require("./vector");

const FRAMES_PER_SEC = 60;

const MAP_SIZE = 1280;
const WHITE_SIZE = 960;
const YOLK_SIZE = 48;
const SCREEN_SIZE = 640;

const WHITE_ACCELERATION = 1000;
const YOLK_ACCELERATION = 1000;
const WHITE_FRICTION = 0.9;
const YOLK_FRICTION = 0.9;

const SELF_SPRING = 2000;
const YOLK_YOLK_SPRING = 50;
const DEFENSIVE_SPRING = 50;
const YOLK_WHITE_SPRING = 200;
const WHITE_WHITE_SPRING = 20;
const MAP_SPRING = 20;

const BITE_INTERVAL = 20;
const BITE_SIZE = 40;

const SHRINK_SPEED = 0.2;

const faces = ["( ͡° ͜ʖ ͡°)", "UwU", "◕‿↼", "( ͡° ᴥ ͡°)", "(ツ)", "(-_-)"];

class Egg {
  constructor(data) {
    this.id = data.id;
    this.name = data.name ?? faces[Math.floor(Math.random() * faces.length)];

    const startX = Math.random() * MAP_SIZE;
    const startY = Math.random() * MAP_SIZE;

    this.whitePos = data.whitePos ?? new Vector(startX, startY);
    this.whiteVel = data.whiteVel ?? new Vector();
    this.whiteAcc = data.whiteAcc ?? new Vector();

    this.whiteSize = data.whiteSize ?? WHITE_SIZE;

    this.yolkPos = data.yolkPos ?? new Vector(startX, startY);
    this.yolkVel = data.yolkVel ?? new Vector();

    this.mousePos = data.mousePos ?? new Vector(startX, startY);
    this.mouseClicked = data.mouseClicked ?? false;

    this.screenPos =
      data.screenPos ??
      new Vector(startX - SCREEN_SIZE / 2, startY + SCREEN_SIZE / 2);

    this.collisions = data.collisions ? { ...data.collisions } : {};
  }

  // mouse position is given relative to screen position
  moveMouse(mousePos) {
    this.mousePos = Vector.sum(mousePos, this.screenPos);
  }

  setMouse(clicked) {
    this.mouseClicked = clicked;
  }

  // change acceleration by direction delta
  moveWhite(dir) {
    this.whiteAcc = Vector.sum(this.whiteAcc, dir);
  }

  updatePosition() {
    // handle white physics
    this.whiteMapCollision();
    // white should move slower if yolk is not in its bounds
    if (this.yolkInWhite()) {
      this.whiteVel = Vector.sum(
        this.whiteVel,
        Vector.scale(WHITE_ACCELERATION / FRAMES_PER_SEC, this.whiteAcc)
      );
    } else {
      this.whiteVel = Vector.sum(
        this.whiteVel,
        Vector.scale(WHITE_ACCELERATION / FRAMES_PER_SEC / 2, this.whiteAcc)
      );
    }
    this.whiteVel = Vector.scale(WHITE_FRICTION, this.whiteVel);
    this.whitePos = Vector.sum(
      this.whitePos,
      Vector.scale(1 / FRAMES_PER_SEC, this.whiteVel)
    );

    // if mouse down, pull yolk forwards
    let yolkAcc = new Vector(0, 0);
    if (this.mouseClicked) {
      const toMouse = Vector.diff(this.mousePos, this.yolkPos);
      yolkAcc = Vector.sum(
        yolkAcc,
        Vector.scale(YOLK_ACCELERATION / Math.sqrt(toMouse.norm()), toMouse)
      );
    }

    // spring to pull back yolk
    const toWhite = Vector.diff(this.whitePos, this.yolkPos);
    yolkAcc = Vector.sum(
      yolkAcc,
      Vector.scale(SELF_SPRING / FRAMES_PER_SEC, toWhite)
    );

    // handle yolk physics
    this.yolkVel = Vector.sum(
      this.yolkVel,
      Vector.scale(1 / FRAMES_PER_SEC, yolkAcc)
    );
    this.yolkVel = Vector.scale(YOLK_FRICTION, this.yolkVel);
    this.yolkPos = Vector.sum(
      this.yolkPos,
      Vector.scale(1 / FRAMES_PER_SEC, this.yolkVel)
    );

    // scroll screen with white
    this.screenPos = Vector.sum(
      this.screenPos,
      Vector.scale(1 / FRAMES_PER_SEC, this.whiteVel)
    );

    // make sure mouse position stays consistent with screen scroll
    this.mousePos = Vector.sum(
      this.mousePos,
      Vector.scale(1 / FRAMES_PER_SEC, this.whiteVel)
    );

    // lets try making eggs shrink as you go
    // this.whiteSize -= SHRINK_SPEED;
  }

  yolkInWhite() {
    return Vector.dist(this.whitePos, this.yolkPos) < this.whiteSize / 10;
  }

  // TODO: refactor this code - vectors should be immutable
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

  static getSpringAcc = (v, w, radius, springConst) => {
    const normal = Vector.diff(v, w);
    const magnitude = springConst * (radius - normal.norm());
    return Vector.scale(magnitude / normal.norm() / FRAMES_PER_SEC, normal);
  };

  static yolkYolkCollision = (a, b) => {
    if (Vector.dist(a.yolkPos, b.yolkPos) < 2 * YOLK_SIZE) {
      a.yolkVel = Vector.sum(
        a.yolkVel,
        this.getSpringAcc(a.yolkPos, b.yolkPos, 2 * YOLK_SIZE, YOLK_YOLK_SPRING)
      );
    }
  };

  static yolkWhiteCollision = (a, b) => {
    if (Vector.dist(a.yolkPos, b.whitePos) < b.whiteSize / 10) {
      a.yolkVel = Vector.sum(
        a.yolkVel,
        this.getSpringAcc(
          a.yolkPos,
          b.whitePos,
          b.whiteSize / 10,
          YOLK_WHITE_SPRING
        )
      );

      if (!(a.id in b.collisions)) {
        b.collisions[a.id] = 0;
      }

      // only after being in contact for BITE_INTERVAL time will a bite be taken
      if (++b.collisions[a.id] == BITE_INTERVAL) {
        b.whiteSize -= BITE_SIZE;
        delete b.collisions[a.id];
      }
    } else {
      // reset bite counter if not in contact
      delete b.collisions[a.id];
    }
  };

  static whiteWhiteCollision = (a, b) => {
    const diameter = (a.whiteSize + b.whiteSize) / 10;
    if (Vector.dist(a.whitePos, b.whitePos) < diameter) {
      a.whiteVel = Vector.sum(
        a.whiteVel,
        this.getSpringAcc(a.whitePos, b.whitePos, diameter, WHITE_WHITE_SPRING)
      );
    }
  };

  clone() {}
}

module.exports = Egg;
