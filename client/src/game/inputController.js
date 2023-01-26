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
import { ARROW_CODE, DIRECTION } from "../../../shared/constants.js";

export default class InputController {
  constructor(game) {
    this.game = game;
  }

  onKeyDown(event) {
    if (event.repeat) return;
    if (event.key == " ") {
      sendSpacebarDown();
    } else if (event.key in ARROW_CODE) {
      const key = ARROW_CODE[event.key];
      sendArrowDown(key);
      setTimeout(
        () =>
          this.game.gameState?.moveWhite(this.game.playerId, DIRECTION[key]),
        socketPing
      );
    }
  }

  onKeyUp(event) {
    if (event.key == " ") {
      sendSpacebarUp();
    } else if (event.key in ARROW_CODE) {
      const key = ARROW_CODE[event.key];
      sendArrowUp(key);
      setTimeout(
        () =>
          this.game.gameState?.moveWhite(
            this.game.playerId,
            Vector.scale(-1, DIRECTION[key])
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
