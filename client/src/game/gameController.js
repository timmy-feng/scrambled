import GameState from "../../../shared/gameState";
import { socket, socketPing } from "../client-socket";
import Vector from "../../../shared/vector";
import { GAME, ARROW_CODE } from "../../../shared/constants";
import GraphicsController from "./graphicsController";

// when client and server states are different,
// use weighted average for smoothing
const WEIGHT_OLD = 0.99;

// since udp has no guarantee on packet ordering
// if a packet is sent too many frames in the past,
// we discard it
const MAX_FRAME_JUMP = 3;

const MOUSE_PER_SEC = 10;

const getWeightedAverage = (prev, next) => {
  return Vector.sum(
    Vector.scale(WEIGHT_OLD, prev),
    Vector.scale(1 - WEIGHT_OLD, next)
  );
};

export default class GameController { 
  constructor(canvas, playerId) {
    this.canvas = canvas;
    this.playerId = playerId;
    this.graphics = new GraphicsController(canvas.getContext("2d"), playerId, canvas);

    this.renderLoop = setInterval(() => {
      if (this.gameState) {
        for (const update of this.gameState.update()) {
          if (update.id == this.playerId && update.type in this.eventHandler) {
            this.eventHandler[update.type]();
          }
        }
        this.graphics.render(this.gameState);
      }
    }, 1000 / GAME.FRAMES_PER_SEC);

    // how many times we played AY
    // make sure we're not behind what the game state says
    this.playAy = 0;

    this.eventHandler = {};
  }

  addEventListener(eventName, callback) {
    this.eventHandler[eventName] = callback;
  }

  removeEventListener(eventName) {
    delete this.eventHandler[eventName];
  }

  serverUpdate(gameState) {
    const nextState = new GameState({ ...gameState, predictMode: true });
    if (this.gameState) {
      if (nextState.framesPassed + MAX_FRAME_JUMP < this.gameState.framesPassed)
        return;

      for (const next in nextState.eggs) {
        const prev = this.gameState.getEggById(next.id);
        if (prev) {
          next.whitePos = getWeightedAverage(prev.whitePos, next.whitePos);
          next.yolkPos = getWeightedAverage(prev.yolkPos, next.yolkPos);
          next.screenPos = getWeightedAverage(prev.screenPos, next.screenPos);
          next.mousePos = getWeightedAverage(prev.mousePos, next.mousePos);
        }
      }
    }
    this.gameState = nextState;
  }

  // input handling code below

  move(input) {
    socket.emit("input", input);
    setTimeout(
      () => this.gameState?.handleInput(this.playerId, input),
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
    if (this.graphics.panelState == 2) {
      this.graphics.panelState = 3;
    }
    this.onPointerMove(event);
    this.move({ type: "pointerDown" });
  }

  onPointerUp(event) {
    this.move({ type: "pointerUp" });
  }

  onPointerMove(event) {
    if (this.pointerTimeout) return;

    const rect = this.canvas.getBoundingClientRect();
    let pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);
    pos = Vector.scale(GAME.SCREEN_SIZE / rect.height, pos);

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
