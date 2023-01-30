export default class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  static dist(v, w) {
    return Vector.diff(v, w).mag();
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

  static dot(v, w) {
    return (v.x * w.x + v.y * w.y);
  }

  static polarToCartesian(r, theta) {
    return new Vector(r * Math.cos(theta), r * Math.sin(theta));
  }

  static midpoint(v, w) {
    return new Vector((v.x + w.x)/2, (v.y + w.y)/2)
  }

  //  gets CW unit normal vector
  static unitNormal(v, w) {
    let unitVec = Vector.diff(v, w).norm();

    return new Vector(unitVec.y, -unitVec.x);
  }

  norm() {
    return Vector.scale(1 / this.mag(), this);
  }
}

//module.exports = Vector;
