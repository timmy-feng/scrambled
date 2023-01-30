import Vector from "./vector.js"

const FRAMES_PER_SECOND = 60;

export default class Mass{
  constructor(props) {
    //vectors
    this.pos = props.pos;
    this.vel = props.vel ?? new Vector(0,0);
    this.acc = props.acc ?? new Vector(0,0);
  }

  getPos() {
    return this.pos;
  }

  setPos(pos) {
    this.pos = pos;
  }

  setVel(vel) {
    this.vel = vel;
  }

  addAcc(acc) {
    this.acc = Vector.sum(this.acc, acc);
  }

  setAcc(acc) {
    this.acc = acc;
  }

  updatePos(){
    const deltaVel = Vector.scale(1/FRAMES_PER_SECOND, this.acc);
    this.vel = Vector.sum(this.vel, deltaVel);

    const deltaPos = Vector.scale(1/FRAMES_PER_SECOND, this.vel);
    this.pos = Vector.sum(this.pos, deltaPos);
  }

  
}
