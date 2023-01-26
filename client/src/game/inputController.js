import {
  sendSpacebarDown,
  sendSpacebarUp,
  sendArrowDown,
  sendArrowUp,
  sendMouseDown,
  sendMouseUp,
  sendMouseMove,
  socketPing,
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
      sendArrowDown(key);
      setTimeout(
        () =>
          this.game.gameState?.moveWhite(this.game.playerId, direction[key]),
        socketPing
      );
    }
  }

  onKeyUp(event) {
    if (event.key == " ") {
      sendSpacebarUp();
    } else if (event.key in arrowCode) {
      const key = arrowCode[event.key];
      sendArrowUp(key);
      setTimeout(
        () =>
          this.game.gameState?.moveWhite(
            this.game.playerId,
            Vector.scale(-1, direction[key])
          ),
        socketPing
      );
    }
  }

  onMouseDown() {
    sendMouseDown();
    setTimeout(
      () => this.game.gameState?.setMouse(this.game.playerId, true),
      socketPing
    );
  }

  onMouseUp() {
    sendMouseUp();
    setTimeout(
      () => this.game.gameState?.setMouse(this.game.playerId, false),
      socketPing
    );
  }

  onMouseMove(event, canvas) {
    const rect = canvas.current.getBoundingClientRect();
    const mousePos = new Vector(
      event.clientX - rect.left,
      -(event.clientY - rect.top)
    );
    sendMouseMove(mousePos);
    setTimeout(
      () => this.game.gameState?.moveMouse(this.game.playerId, mousePos),
      socketPing
    );
  }
}
