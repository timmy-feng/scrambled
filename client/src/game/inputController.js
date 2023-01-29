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
import { ARROW_CODE, GAME } from "../../../shared/constants.js";

const MOUSE_PER_SEC = 10;

export default class InputController {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.mouseTimeout = false;
  }

  onKeyDown(event) {
    if (event.repeat) return;
    if (event.key == " ") {
      sendSpacebarDown();
    } else if (event.key in ARROW_CODE) {
      const key = ARROW_CODE[event.key];
      sendArrowDown(key);
      setTimeout(
        () => this.game.gameState?.setArrow(this.game.playerId, key, true),
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
        () => this.game.gameState?.setArrow(this.game.playerId, key, false),
        socketPing
      );
    }
  }

  onMouseDown(event) {
    if (event.button != 0) return;
    this.onMouseMove(event);
    sendMouseDown();
    setTimeout(
      () => this.game.gameState?.setMouse(this.game.playerId, true),
      socketPing
    );
  }

  onMouseUp(event) {
    if (event.button != 0) return;
    sendMouseUp();
    setTimeout(
      () => this.game.gameState?.setMouse(this.game.playerId, false),
      socketPing
    );
  }

  onMouseMove(event) {
    if (this.mouseTimeout) return;

    const rect = this.canvas.current.getBoundingClientRect();
    let mousePos = new Vector(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    if (
      mousePos.x < 0 ||
      mousePos.x > GAME.SCREEN_SIZE ||
      mousePos.y < 0 ||
      mousePos.y > GAME.SCREEN_SIZE
    ) {
      return;
    }

    mousePos = new Vector(mousePos.x, -mousePos.y);
    sendMouseMove(mousePos);
    setTimeout(
      () => this.game.gameState?.moveMouse(this.game.playerId, mousePos),
      socketPing
    );

    this.mouseTimeout = true;
    setTimeout(() => (this.mouseTimeout = false), 1000 / MOUSE_PER_SEC);
  }
}
