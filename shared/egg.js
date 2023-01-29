const Vector = require("./vector");
const {
  GAME,
  WHITE,
  YOLK,
  SPRING,
  BITE,
  FACES,
  DIRECTION,
} = require("./constants");

class Egg {
  // requires data.id
  constructor(data) {
    this.id = data.id;
    this.name = data.name ?? FACES[Math.floor(Math.random() * FACES.length)];

    const startX = Math.random() * GAME.MAP_SIZE;
    const startY = Math.random() * GAME.MAP_SIZE;

    this.whitePos = data.whitePos ?? new Vector(startX, startY);
    this.whiteVel = data.whiteVel ?? new Vector();

    this.whiteDir = data.whiteDir ?? new Vector();

    this.whiteSize = data.whiteSize ?? WHITE.INIT_SIZE;

    this.yolkPos = data.yolkPos ?? new Vector(startX, startY);
    this.yolkVel = data.yolkVel ?? new Vector();

    this.mousePos = data.mousePos ?? new Vector(startX, startY);
    this.mouseClicked = data.mouseClicked ?? false;
    this.arrowPressed = data.arrowPressed ?? [false, false, false, false];

    this.screenPos =
      data.screenPos ??
      new Vector(startX - GAME.SCREEN_SIZE / 2, startY + GAME.SCREEN_SIZE / 2);

    this.collisions = data.collisions ? { ...data.collisions } : {};

    // let's try this again LOL
    this.playAy = data.playAy ?? 0;
  }

  // mouse position is given relative to screen position
  moveMouse(mousePos) {
    this.mousePos = Vector.sum(mousePos, this.screenPos);
  }

  setMouse(clicked) {
    this.mouseClicked = clicked;
  }

  setArrow(key, pressed) {
    this.arrowPressed[key] = pressed;
    this.whiteDir = new Vector();
    for (let dir = 0; dir < 4; dir++) {
      if (this.arrowPressed[dir])
        this.whiteDir = Vector.sum(this.whiteDir, DIRECTION[dir]);
    }
    if (this.whiteDir.norm() != 0)
      this.whiteDir = Vector.scale(1 / this.whiteDir.norm(), this.whiteDir);
  }

  setDir(dir) {
    if (dir.norm() == 0) {
      this.whiteDir = dir;
    } else {
      this.whiteDir = Vector.scale(1 / dir.norm(), dir);
    }
  }

  getWhiteAcc() {
    let whiteAcc = Vector.scale(
      WHITE.ACCELERATION / GAME.FRAMES_PER_SEC,
      this.whiteDir
    );

    // experimental way of making white slower the farther the yolk is
    // whiteAcc = Vector.scale(
    //   (1000 - Vector.dist(this.yolkPos, this.whitePos)) / 1000,
    //   whiteAcc
    // );

    if (!this.yolkInWhite()) whiteAcc = Vector.scale(0.75, whiteAcc);

    return whiteAcc;
  }

  updatePosition() {
    // handle white physics
    this.whiteMapCollision();
    this.whiteVel = Vector.sum(this.whiteVel, this.getWhiteAcc());
    this.whiteVel = Vector.scale(WHITE.FRICTION, this.whiteVel);
    this.whitePos = Vector.sum(
      this.whitePos,
      Vector.scale(1 / GAME.FRAMES_PER_SEC, this.whiteVel)
    );

    // if mouse down, pull yolk forwards
    let yolkAcc = new Vector();
    if (this.mouseClicked) {
      const toMouse = Vector.diff(this.mousePos, this.yolkPos);
      yolkAcc = Vector.sum(
        yolkAcc,
        Vector.scale(YOLK.ACCELERATION / Math.sqrt(toMouse.norm()), toMouse)
      );
    }

    // spring to pull back yolk
    const toWhite = Vector.diff(this.whitePos, this.yolkPos);
    yolkAcc = Vector.sum(
      yolkAcc,
      Vector.scale(SPRING.SELF / GAME.FRAMES_PER_SEC, toWhite)
    );

    // handle yolk physics
    this.yolkVel = Vector.sum(
      this.yolkVel,
      Vector.scale(1 / GAME.FRAMES_PER_SEC, yolkAcc)
    );
    this.yolkVel = Vector.scale(YOLK.FRICTION, this.yolkVel);
    this.yolkPos = Vector.sum(
      this.yolkPos,
      Vector.scale(1 / GAME.FRAMES_PER_SEC, this.yolkVel)
    );

    // scroll screen with white
    this.screenPos = Vector.sum(
      this.screenPos,
      Vector.scale(1 / GAME.FRAMES_PER_SEC, this.whiteVel)
    );

    // make sure mouse position stays consistent with screen scroll
    this.mousePos = Vector.sum(
      this.mousePos,
      Vector.scale(1 / GAME.FRAMES_PER_SEC, this.whiteVel)
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

  static getSpringAcc = (v, w, radius, springConst) => {
    const normal = Vector.diff(v, w);
    const magnitude = springConst * (radius - normal.norm());
    return Vector.scale(
      magnitude / normal.norm() / GAME.FRAMES_PER_SEC,
      normal
    );
  };

  static yolkYolkCollision = (a, b) => {
    if (Vector.dist(a.yolkPos, b.yolkPos) < 2 * YOLK.SIZE) {
      a.yolkVel = Vector.sum(
        a.yolkVel,
        this.getSpringAcc(a.yolkPos, b.yolkPos, 2 * YOLK.SIZE, SPRING.YOLK_YOLK)
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
          SPRING.YOLK_WHITE
        )
      );

      if (!(a.id in b.collisions)) {
        b.collisions[a.id] = 0;
      }

      // only after being in contact for BITE_INTERVAL time will a bite be taken
      if (++b.collisions[a.id] == BITE.INTERVAL) {
        b.whiteSize -= BITE.SIZE;
        // a.mouseClicked = false;
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
        this.getSpringAcc(a.whitePos, b.whitePos, diameter, SPRING.WHITE_WHITE)
      );
    }
  };

  clone() {}
}

module.exports = Egg;
