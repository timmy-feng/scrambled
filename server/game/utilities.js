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

module.exports = { Vector };
