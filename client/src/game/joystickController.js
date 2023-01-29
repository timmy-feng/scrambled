import { Application, Graphics } from "pixi.js";
import { sendJoystick } from "../client-socket";
import Vector from "../../../shared/vector";

const CANVAS_SIZE = 320;
const KNOB_SIZE = 80;

const KNOB_THRESHOLD = 32;

const POINTER_PER_SEC = 10;

const center = new Vector(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

export default class JoystickController {
  constructor(canvas, game) {
    this.canvas = canvas;

    this.pixiApp = new Application({
      view: this.canvas.current,
      backgroundColor: 0xffffff,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
    });

    this.knob = new Graphics();
    this.knob.beginFill(0xffc040);
    this.knob.drawCircle(0, 0, KNOB_SIZE);
    this.knob.position = { ...center };

    this.pixiApp.stage.addChild(this.knob);

    this.pointerTimeout = false;
    this.pointerCount = 0;

    this.game = game;
  }

  onPointerDown(event) {
    this.pointerCount += 1;
    this.onPointerMove(event);
  }

  onPointerMove(event) {
    if (this.pointerCount == 0) return;

    const rect = this.canvas.current.getBoundingClientRect();
    let pointerPos = new Vector(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    if (
      pointerPos.x < 0 ||
      pointerPos.x > CANVAS_SIZE ||
      pointerPos.y < 0 ||
      pointerPos.y > CANVAS_SIZE
    ) {
      return;
    }

    const dir = Vector.diff(pointerPos, center);
    this.setDir(dir, !this.pointerTimeout);

    if (!this.pointerTimeout) {
      this.pointerTimeout = true;
      setTimeout(() => (this.pointerTimeout = false), 1000 / POINTER_PER_SEC);
    }
  }

  onPointerUp(event) {
    this.pointerCount -= 1;
    if (this.pointerCount == 0) {
      this.setDir(new Vector());
    }
  }

  setDir(dir, send = true) {
    this.knob.position = { ...Vector.sum(dir, center) };
    dir = new Vector(dir.x, -dir.y);
    if (dir.norm() < KNOB_THRESHOLD) dir = new Vector();
    if (send) {
      sendJoystick(dir);
      this.game.gameState?.setDir(dir);
    }
  }
}
