// animations
//   eating other white: 3 frames
//   stunned - eyes squiggly: 3 frames, alt between last 2
//   burning: overlay with 2 frames
//   shoot tomato: reuse eating 2 frames

import { YOLK } from "../../../shared/constants";

//   isEating, isStunned, isShootingTomato
const frameConstant = 5;

const imageFrom = (src) => {
  const image = new Image();
  image.src = src;
  return image;
};

const EAT = ["eat-1.png", "eat-2.png", "eat-3.png", "eat-4.png"];
const STUNNED = ["stun-1.png", "stun-2.png", "stun-3.png"];
const FIRE = ["fire-overlay-1.png", "fire-overlay-2.png"];

const eatImgs = EAT.map((eat) => imageFrom(eat));
const stunnedImgs = STUNNED.map((stun) => imageFrom(stun));
const fireImgs = FIRE.map((fire) => imageFrom(fire));

const yolkNormal = imageFrom("yolk-head.png");
const yolkEat = imageFrom("eat-3.png");
const yolkStun = imageFrom("stun-2.png");
const yolkShoot = imageFrom("eat-1.png");
const yolkHurt = imageFrom("stun-1.png");

export default class YolkGraphic {
  constructor() {
    this.anim = "normal";
    this.i = 0;
    this.image = yolkNormal;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  setPos(pos) {
    this.pos = pos;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  // eating, stunned, tomato
  setAnim(anim) {
    if (anim !== this.anim) {
      this.anim = anim;
      this.i = 0;
    }

    if (this.anim === "eat") {
      this.updateEatAnim();
    } else if (this.anim === "normal") this.image = yolkNormal;
  }

  updateEatAnim() {
   
    this.i = this.i % (eatImgs.length * frameConstant);
    if (this.i % frameConstant === 0) {
      this.image = eatImgs[this.i / frameConstant];
    }

    this.i = this.i + 1;
  }

  setFire(fire) {}

  render(context) {
    /* let image = yolkNormal;
    if (this.anim == "stun") image = yolkStun;
    if (this.anim == "eat") image = yolkEat;
    if (this.anim == "shoot") image = yolkShoot;
    if (this.anim == "hurt") image = yolkHurt; */

    context.save();
    context.globalAlpha = this.alpha;
    context.translate(this.pos.x, this.pos.y);
    context.rotate(this.rotation);
    context.drawImage(
      this.image,
      -YOLK.SIZE,
      -YOLK.SIZE,
      2 * YOLK.SIZE,
      2 * YOLK.SIZE
    );
    context.restore();
  }
}

/* const EAT = ["eat-1.png", "eat-2.png", "eat-3.png", "eat-4.png"];
const STUNNED = ["stun-1.png", "stun-2.png", "stun-3.png"];
const FIRE = ["fire-overlay-1.png", "fire-overlay-2.png"];

export default class YolkGraphic {
  constructor(props) {
    this.action = props.action; // "eat", "stunned", "fire"
    this.yolkImgUrl = "yolk.png";
    this.action = "normal";
    this.i = 0;
  }

  setAnim(action) {
    if (action !== this.action) {
      this.i = 0;

      if (action === "eat") {
        //update eat animation
      }
      else if (action === "stun") {

      }
    }
  }

  updateEatAnim() {
    // while action equals bite, loop through images
    i = i % EAT.length;
    this.yolkImgUrl = EAT[i];
    i++;
  }

  updateStunAnim () {
    if (i === 0) {
        this.yolkImgUrl = "stun-1.png";
    }
    else {
        i = i % 2;
    }

  }

  render() {
    // yolk image at position
  }
} */

// pass {bite: false, shoot: false. stunned: false } normally
// but pass {bite: true} if completed a bite
// startAction = "bite", "shoot", "stunned"
// if startAction changes value,
//      start at index 0 of action animation loop
//      render image at index
//      increase index for next render

// set bite taken to true
