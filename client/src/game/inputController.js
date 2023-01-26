import {
  sendSpacebarDown,
  sendSpacebarUp,
  sendArrowDown,
  sendArrowUp,
  sendMouseDown,
  sendMouseUp,
  sendMouseMove,
} from "../client-socket.js";

const arrowCode = {
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

export const onKeyDown = (event) => {
  if (event.repeat) return;
  if (event.key == " ") sendSpacebarDown();
  else if (event.key in arrowCode) sendArrowDown(arrowCode[event.key]);
};

export const onKeyUp = (event) => {
  if (event.key == " ") sendSpacebarUp();
  else if (event.key in arrowCode) sendArrowUp(arrowCode[event.key]);
};

export const onMouseDown = (event) => {
  sendMouseDown();
};

export const onMouseUp = (event) => {
  sendMouseUp();
};

export const onMouseMove = (event, canvas) => {
  const rect = canvas.current.getBoundingClientRect();
  sendMouseMove(
    new Vector(event.clientX - rect.left, -(event.clientY - rect.top))
  );
};

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(c) {
    this.x *= c;
    this.y *= c;
    return this;
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dist(v) {
    return Vector.diff(this, v).norm();
  }

  lineDist(l1, l2) {
    return Math.min(this.dist(l1), this.dist(l2));
  }

  static diff(v, w) {
    return new Vector(v.x - w.x, v.y - w.y);
  }

  static scalarProd(c, v) {
    return new Vector(c * v.x, c * v.y);
  }
}
