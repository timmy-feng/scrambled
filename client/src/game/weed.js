import { GAME } from "../../../shared/constants";
import Vector from "../../../shared/vector";

const WEED_SIZE = 480;
const WEED_DURATION = 300;

export default class Weed {
  constructor() {
    this.pos = Vector.sum(
      new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
      Vector.polar(
        (Math.random() * GAME.MAP_SIZE) / 2,
        Math.random() * 2 * Math.PI
      )
    );
    this.rotation = Math.random() * 2 * Math.PI;
    this.duration = WEED_DURATION;
  }

  render(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y);
    context.globalAlpha = Math.min(1, (2 * this.duration) / WEED_DURATION);
    context.rotate(this.rotation);
    context.fillStyle = "#008000";
    context.fillRect(-WEED_SIZE / 2, -WEED_SIZE / 2, WEED_SIZE, WEED_SIZE);
    context.restore();
    this.duration = Math.max(this.duration - 1, 0);
  }
}
