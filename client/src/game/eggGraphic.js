/* things to fix:
always drawRect/ drawCircle at origin,
then set the position somewhere else
setting position for a grphic is like saying that point is now (0,0)
moveTo changes the drawing position, but not the actual position
*/

import Vector from "../../../shared/vector";
import { Graphics, Container } from "pixi.js";
import Mass from "./Mass.js";

const NUM_MASSES = 8;

// shape
const R_WHITE = 100;
const BUFFER = 35; // to keep bezier curves surrounding white
const R_YOLK = 60; // fix

// springs
const k_r = 100; // radial spring constant
const k_t = 10; //tangent spring constant
const D = 3; // spring dampening constant

const eq_r = 20;
const eq_t = 2 * (R_WHITE * Math.sin((2 * Math.PI) / NUM_MASSES / 2)); //spring equilibrium length

// pressure
const P = 100000; // nRT from PV = nRT

// graphics
const MASS_RADIUS = 5;

// calc
const EPSILON = 3;

// testing
const V_WHITE = 300;

// convenience
let offsetUnitVecs = [];

for (let i = 0; i < NUM_MASSES; i++) {
  offsetUnitVecs.push(
    Vector.polarToCartesian(1, ((2 * Math.PI) / NUM_MASSES) * i)
  );
}

export default class EggGraphic extends Container {
  constructor(props) {
    super();
    this.pos = props.pos;
    //this.stage = props.stage;
    console.log("props.pos", props.pos)

    this.centerMass = new Mass({ pos: this.pos });

    this.masses = [];
    for (let i = 0; i < NUM_MASSES; i++) {
      let offset = Vector.scale(R_WHITE + eq_r, offsetUnitVecs[i]);
      let massPos = Vector.sum(offset, props.pos);
      this.masses.push(new Mass({ pos: massPos }));
    }

    // test
    let massGraphic = new Graphics();
    massGraphic.beginFill("0xffaa00");
    massGraphic.drawCircle(0, 0, 300);
    massGraphic.endFill();
    massGraphic.x = props.pos.x
    massGraphic.y = props.pos.y

    this.addChild(massGraphic)

    this.updateAcc()
  }

  getVolume() {
    // shoelace th.
    let volume = 0;
    let psum = 0;
    let nsum = 0;

    for (let i = 0; i < NUM_MASSES; i++) {
      let j = (i + 1) % NUM_MASSES;
      psum += this.masses[i].pos.x * this.masses[j].pos.y;
    }

    for (let i = 0; i < NUM_MASSES; i++) {
      let j = (i + 1) % NUM_MASSES;
      nsum += this.masses[i].pos.y * this.masses[j].pos.x;
    }

    volume = 0.5 * Math.abs(psum - nsum);

    // subtract solid white
    //volume -= Math.PI * R_WHITE * R_WHITE;
    return volume;
  }

  addSpringAcc(m1, m2, k, D, eq) {
    // spring force
    const distVec = Vector.diff(m1.pos, m2.pos);
    const springAcc = Vector.scale(-k * (distVec.mag() - eq), distVec.unit());

    // dampening
    const velDiff = Vector.diff(m1.vel, m2.vel);
    const dampAcc = Vector.scale(
      (-D * Vector.dot(velDiff, distVec)) / distVec.mag(),
      distVec.unit()
    );

    m1.addAcc(Vector.sum(springAcc, dampAcc));
    m2.addAcc(Vector.scale(-1, Vector.sum(springAcc, dampAcc)));
  }

  updateAcc() {
    // radial springs
    for (let i = 0; i < NUM_MASSES; i++) {
      this.masses[i].setAcc(new Vector(0, 0));
      let connectOffset = Vector.scale(R_WHITE, offsetUnitVecs[i]);
      let connectPos = Vector.sum(this.centerMass.pos, connectOffset);
      this.addSpringAcc(
        this.masses[i],
        new Mass({ pos: connectPos }),
        k_r,
        D,
        eq_r
      );
    }

    // circumference springs
    for (let i = 0; i < NUM_MASSES; i++) {
      let j = (i + 1) % NUM_MASSES;
      this.addSpringAcc(this.masses[i], this.masses[j], k_t, D, eq_t);
    }

    //pressure
    let volume = this.getVolume();

    for (let i = 0; i < NUM_MASSES; i++) {
      let j = (i + 1) % NUM_MASSES;
      const dist = Vector.diff(this.masses[j].pos, this.masses[i].pos).mag();
      //check volume not equal to zero?
      const pressureMag = (dist * P) / volume;

      // unit normal is oriented outside bc masses are ordered CCW
      const pressureAcc = Vector.scale(
        pressureMag,
        Vector.unitNormal(this.masses[j].pos, this.masses[i].pos)
      );

      this.masses[i].addAcc(pressureAcc);
      this.masses[j].addAcc(pressureAcc);
    }

    for (let i = 0; i < NUM_MASSES; i++) {
      this.masses[i].updatePos();
    }

    // handle collisions of masses w/ buffer
    for (let i = 0; i < NUM_MASSES; i++) {
      if (
        Vector.dist(this.masses[i].pos, this.centerMass.pos) <
        R_WHITE + BUFFER
      ) {
        let radialUnitVec = Vector.diff(
          this.masses[i].pos,
          this.centerMass.pos
        ).unit();
        let tanUnitVec = new Vector(-radialUnitVec.y, radialUnitVec.x);

        let newVel = Vector.scale(
          Vector.dot(tanUnitVec, this.masses[i].vel),
          tanUnitVec
        );
        let newPos = Vector.sum(
          this.centerMass.pos,
          Vector.scale(R_WHITE + BUFFER, radialUnitVec)
        );

        this.masses[i].setVel(newVel);
        this.masses[i].setPos(newPos);
      }
    }

    // center mass
    // override acc and vel on center mass
    //this.centerMass.setAcc(new Vector(0, 0));

    /* if (
      Math.abs(this.ptr.x - this.centerMass.pos.x) < EPSILON &&
      Math.abs(this.ptr.y - this.centerMass.pos.y) < EPSILON // stop jittering
    ) {
      console.log("same");
      this.centerMass.setVel(new Vector());
    } else {
      let centerVel = Vector.scale(
        V_WHITE,
        Vector.diff(this.ptr, this.centerMass.pos).unit()
      );
      this.centerMass.setVel(centerVel);
    } */

    //this.centerMass.updatePos();

    this.updateGraphics();
  }

  /* GRAPHICS */

  createMassGraphic(mass) {
    let massGraphic = new Graphics();
    massGraphic.beginFill("0xffaa00");
    massGraphic.drawCircle(0, 0, MASS_RADIUS);
    massGraphic.endFill();
    massGraphic.x = mass.pos.x;
    massGraphic.y = mass.pos.y;

    return massGraphic;
  }

  createLine(fromMass, toMass) {
    let line = new Graphics();
    line.lineStyle(2, 0xffffff);
    line.moveTo(fromMass.pos.x, fromMass.pos.y);
    line.lineTo(toMass.pos.x, toMass.pos.y);

    return line;
  }

  updateGraphics() {
    this.removeChildren();

    // centermass
    this.addChild(this.createMassGraphic(this.centerMass));

    // bezier curve using midpoints
    const fluidWhite = new Graphics();
    fluidWhite.beginFill("0xffffff");
    fluidWhite.lineStyle(2, 0xaaaaaa);

    for (let i = 0; i < NUM_MASSES; i += 1) {
      let j = (i + 1) % NUM_MASSES;
      let k = (i + 2) % NUM_MASSES;

      let midpt1_x = (this.masses[i].pos.x + this.masses[j].pos.x) / 2;
      let midpt1_y = (this.masses[i].pos.y + this.masses[j].pos.y) / 2;

      let midpt2_x = (this.masses[j].pos.x + this.masses[k].pos.x) / 2;
      let midpt2_y = (this.masses[j].pos.y + this.masses[k].pos.y) / 2;

      if (i === 0) fluidWhite.moveTo(midpt1_x, midpt1_y);
      fluidWhite.quadraticCurveTo(
        this.masses[j].pos.x,
        this.masses[j].pos.y,
        midpt2_x,
        midpt2_y
      );
    }

    this.addChild(fluidWhite);

    // yolk
    let yolk = new Graphics();
    yolk.beginFill("0xff990f");
    yolk.lineStyle(2, 0xaaaaaa);
    yolk.drawCircle(this.centerMass.pos.x, this.centerMass.pos.y, R_YOLK);
    yolk.endFill();
    this.addChild(yolk);

    // buffer 
    // let white = new Graphics();
    // white.beginFill("0x00ffff");
    // white.drawCircle(this.centerMass.pos.x, this.centerMass.pos.y, R_WHITE);
    // white.endFill();
    // this.addChild(white);

    // masses
    // for (let i = 0; i < NUM_MASSES; i++) {
    //   this.addChild(this.createMassGraphic(this.masses[i]));
    // }

    // radial springs
    // for (let i = 0; i < NUM_MASSES; i++) {
    //   let connectOffset = Vector.scale(R_WHITE, offsetUnitVecs[i]);
    //   let connectPos = Vector.sum(this.centerMass.pos, connectOffset);
    //   this.addChild(
    //     this.createLine(this.masses[i], new Mass({ pos: connectPos }))
    //   );
    // }

  }
}
