// WARNING: if frames per second is changed, must change in this file too
const FRAMES_PER_SEC = 60;

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  unit() {
    // for zero vector, define unit to be itself
    if (this.x == 0 && this.y == 0) return new Vector();
    return Vector.scale(1 / this.norm(), this);
  }

  static polar(r, theta) {
    return new Vector(r * Math.cos(theta), r * Math.sin(theta));
  }

  static perp(v) {
    return new Vector(v.y, -v.x);
  }

  static unitNormal(v, w) {
    return Vector.perp(Vector.diff(v, w).unit());
  }

  static dist(v, w) {
    return Vector.diff(v, w).norm();
  }

  static sum(v, w) {
    return new Vector(v.x + w.x, v.y + w.y);
  }

  static diff(v, w) {
    return new Vector(v.x - w.x, v.y - w.y);
  }

  static scale(c, v) {
    return new Vector(c * v.x, c * v.y);
  }

  static applyDelta(v, w) {
    return Vector.sum(v, Vector.scale(1 / FRAMES_PER_SEC, w));
  }

  static dot(v, w) {
    return v.x * w.x + v.y * w.y;
  }
}

module.exports = Vector;
