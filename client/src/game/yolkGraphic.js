// animations
//   eating other white: 3 frames
//   stunned - eyes squiggly: 3 frames, alt between last 2
//   burning: overlay with 2 frames
//   shoot tomato: reuse eating 2 frames

import { YOLK } from "../../../shared/constants";

//   isEating, isStunned, isShootingTomato

const imageFrom = (src) => {
  const image = new Image();
  image.src = src;
  return image;
};

const yolkNormal = imageFrom("yolk-head.png");
const yolkEat = imageFrom("eat-3.png");
const yolkStun = imageFrom("stun-2.png");
const yolkShoot = imageFrom("eat-1.png");
const yolkHurt = imageFrom("stun-1.png");

export default class YolkGraphic {
  constructor() {
    this.anim = "normal";
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
    this.anim = anim;
  }

  setFire(fire) {}

  render(context) {
    let image = yolkNormal;
    if (this.anim == "stun") image = yolkStun;
    if (this.anim == "eat") image = yolkEat;
    if (this.anim == "shoot") image = yolkShoot;
    if (this.anim == "hurt") image = yolkHurt;

    context.save();
    context.globalAlpha = this.alpha;
    context.translate(this.pos.x, this.pos.y);
    context.rotate(this.rotation);
    context.drawImage(
      image,
      -YOLK.SIZE,
      -YOLK.SIZE,
      2 * YOLK.SIZE,
      2 * YOLK.SIZE
    );
    context.restore();
  }
}
