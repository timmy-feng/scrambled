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

export default class YolkGraphic {
  constructor() {}

  setRotation(rotation) {
    this.rotation = rotation;
  }

  setPos(pos) {
    this.pos = pos;
  }

  // eating, stunned, tomato
  setAction(action) {
    if (action != this.action) {
      this.action = action;
      this.animation = action;
      this.frame = 0;
    }
  }

  render(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y);
    context.rotate(this.rotation);
    console.log(`draw at ${this.pos}`);
    context.drawImage(
      yolkNormal,
      -YOLK.SIZE,
      -YOLK.SIZE,
      2 * YOLK.SIZE,
      2 * YOLK.SIZE
    );
    context.restore();
  }
}
