class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
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
}

module.exports = Vector;
