import {
  sendSpacebarDown,
  sendSpacebarUp,
  sendArrowDown,
  sendArrowUp,
  sendMouseDown,
  sendMouseUp,
  sendMouseMove,
} from "../client-socket.js";
import Vector from "../../../shared/vector.js";

const arrowCode = {
  ArrowUp: 0,
  w: 0,
  W: 0,
  ArrowDown: 1,
  s: 1,
  S: 1,
  ArrowRight: 2,
  d: 2,
  D: 2,
  ArrowLeft: 3,
  a: 3,
  A: 3,
};

const direction = [
  new Vector(0, 1),
  new Vector(0, -1),
  new Vector(1, 0),
  new Vector(-1, 0),
];

export default class InputController {
  constructor(game) {
    this.game = game;
  }

  onKeyDown(event) {
    if (event.repeat) return;
    if (event.key == " ") {
      sendSpacebarDown();
    } else if (event.key in arrowCode) {
      const key = arrowCode[event.key];
      this.game.gameState?.moveWhite(this.game.playerId, direction[key]);
      sendArrowDown(key);
    }
  }

  onKeyUp(event) {
    if (event.key == " ") {
      sendSpacebarUp();
    } else if (event.key in arrowCode) {
      const key = arrowCode[event.key];
      this.game.gameState?.moveWhite(
        this.game.playerId,
        Vector.scale(-1, direction[key])
      );
      sendArrowUp(key);
    }
  }

  onMouseDown() {
    this.game.gameState?.setMouse(this.game.playerId, true);
    sendMouseDown();
  }

  onMouseUp() {
    this.game.gameState?.setMouse(this.game.playerId, false);
    sendMouseUp();
  }

  onMouseMove(event, canvas) {
    const rect = canvas.current.getBoundingClientRect();
    const mousePos = new Vector(
      event.clientX - rect.left,
      -(event.clientY - rect.top)
    );
    this.game.gameState?.moveMouse(this.game.playerId, mousePos);
    sendMouseMove(mousePos);
  }
}
