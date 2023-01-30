import { socket, socketPing } from "../client-socket.js";
import Vector from "../../../shared/vector.js";
import { ARROW_CODE, GAME } from "../../../shared/constants.js";

const MOUSE_PER_SEC = 10;

export default class InputController {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.pointerTimeout = false;
  }

  move(input) {
    socket.emit("input", input);
    setTimeout(
      () => this.game.gameState?.handleInput(this.game.playerId, input),
      socketPing
    );
  }

  onKeyDown(event) {
    if (event.repeat) return;
    if (event.key in ARROW_CODE) {
      this.move({
        type: "arrowDown",
        key: ARROW_CODE[event.key],
        keyDown: true,
      });
    }
  }

  onKeyUp(event) {
    if (event.key in ARROW_CODE) {
      this.move({
        type: "arrowUp",
        key: ARROW_CODE[event.key],
        keyDown: false,
      });
    }
  }

  onPointerDown(event) {
    this.onPointerMove(event);
    this.move({ type: "pointerDown" });
  }

  onPointerUp(event) {
    this.move({ type: "pointerUp" });
  }

  onPointerMove(event) {
    if (this.pointerTimeout) return;

    const rect = this.canvas.current.getBoundingClientRect();
    let pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);

    if (
      pos.x < 0 ||
      pos.x > GAME.SCREEN_SIZE ||
      pos.y < 0 ||
      pos.y > GAME.SCREEN_SIZE
    ) {
      return;
    }

    pos = new Vector(
      pos.x + GAME.MAP_SIZE / 2 - GAME.SCREEN_SIZE / 2,
      -pos.y + GAME.MAP_SIZE / 2 + GAME.SCREEN_SIZE / 2
    );
    this.move({ type: "pointerMove", pos });

    this.pointerTimeout = true;
    setTimeout(() => (this.pointerTimeout = false), 1000 / MOUSE_PER_SEC);
  }
}
