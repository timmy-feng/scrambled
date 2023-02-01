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
const STUNNED = ["stun-2.png", "stun-3.png"];
const FIRE = ["fire-overlay-1.png", "fire-overlay-2.png"];
const SHOOT = ["eat-1.png", "eat-2.png"];

const COSTUMES = [];
for (let i = 0; i < 8; ++i) {
  COSTUMES.push(`costumes/cos${i}.png`);
}

const eatImgs = EAT.map((eat) => imageFrom(eat));
const stunnedImgs = STUNNED.map((stun) => imageFrom(stun));
const fireImgs = FIRE.map((fire) => imageFrom(fire));
const shootImgs = SHOOT.map((shoot) => imageFrom(shoot));
const costumeImgs = COSTUMES.map((costume) => imageFrom(costume));
const normalImg = imageFrom("yolk-head.png");
const hurtImg = imageFrom("stun-1.png");

export default class YolkGraphic {
  constructor(costume) {
    this.anim = "normal";
    this.frame = 0;
    this.fire = false;
    this.alpha = 1;

    this.costume = costume;
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
    if (anim != this.anim) {
      this.anim = anim;
      this.frame = 0;
    }
  }

  setFire(fire) {
    this.fire = fire;
  }

  render(context) {
    let image = normalImg;
    if (this.anim == "eat") {
      image = eatImgs[Math.floor(this.frame / frameConstant) % eatImgs.length];
    } else if (this.anim == "stun") {
      image =
        stunnedImgs[
          Math.floor(this.frame / frameConstant) % stunnedImgs.length
        ];
    } else if (this.anim == "hurt") {
      image = hurtImg;
    } else if (this.anim == "shoot") {
      image =
        shootImgs[Math.floor(this.frame / frameConstant) % shootImgs.length];
    }

    context.save();
    context.globalAlpha = this.alpha;
    context.translate(this.pos.x, this.pos.y);
    context.rotate(this.rotation);
    if (this.fire) {
      context.drawImage(
        fireImgs[Math.floor(this.frame / frameConstant) % fireImgs.length],
        -YOLK.SIZE,
        -3 * YOLK.SIZE,
        2 * YOLK.SIZE,
        4 * YOLK.SIZE
      );
    }
    context.drawImage(
      image,
      -YOLK.SIZE,
      -YOLK.SIZE,
      2 * YOLK.SIZE,
      2 * YOLK.SIZE
    );
    if (this.costume) {
      context.drawImage(
        costumeImgs[this.costume],
        -YOLK.SIZE,
        -1.7 * YOLK.SIZE,
        1.1 * 2 * YOLK.SIZE,
        1.1 * 2.6 * YOLK.SIZE
      );
    }
    context.restore();

    this.frame += 1;
  }
}
