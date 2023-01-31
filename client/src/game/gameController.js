import * as PIXI from "pixi.js";
import { Sprite, Application } from "pixi.js";

import GameState from "../../../shared/gameState";
import { socket, socketPing } from "../client-socket";
import Vector from "../../../shared/vector";
import { GAME, YOLK, TOMATO, ARROW_CODE } from "../../../shared/constants";
import EggGraphic from "./eggGraphic";

const fabiTexture = {
  gummy: { icon: PIXI.Texture.from("fabidead.png"), scale: 0.2 },
  spring: { icon: PIXI.Texture.from("fabiboing.png"), scale: 0.15 },
  freeze: { icon: PIXI.Texture.from("fabifreeze.png"), scale: 0.15 },
  speed: { icon: PIXI.Texture.from("fabispice.png"), scale: 0.15 },
  invisible: { icon: PIXI.Texture.from("fabicloak.png"), scale: 0.15 },
  armed: { icon: PIXI.Texture.from("fa-b-ball.png"), scale: 0.15 },
};

const kirbyAy = new Audio("kirbyAy.wav");

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

const getCircle = (center, radius, color, alpha = 1) => {
  const circle = new PIXI.Graphics();
  circle.beginFill(color, alpha);
  circle.drawCircle(0, 0, radius);
  circle.position = { x: center.x, y: center.y };
  return circle;
};

export default class GameController {
  constructor(canvas) {
    this.canvas = canvas;
    this.pixiApp = new Application({
      view: canvas,
      backgroundColor: 0xffffff,
      width: GAME.SCREEN_SIZE,
      height: GAME.SCREEN_SIZE,
    });

    this.idToGraphicMap = {};

    this.renderLoop = setInterval(() => {
      if (this.gameState) {
        this.gameState.update();
        this.updateEggGraphic();
        this.render();
      }
    }, 1000 / GAME.FRAMES_PER_SEC);

    // how many times we played AY
    // make sure we're not behind what the game state says
    this.playAy = 0;
  }

  updateEggGraphic() {
    const offset = new Vector(
      GAME.MAP_SIZE / 2 - GAME.SCREEN_SIZE / 2,
      GAME.MAP_SIZE / 2 + GAME.SCREEN_SIZE / 2
    );

    this.gameState.eggs.forEach((egg) => {
      if (!this.idToGraphicMap.hasOwnProperty(egg.id)) {
        // create a new graphic
        let newGraphic = new EggGraphic(
          new Vector(egg.whitePos.x - offset.x, -(egg.whitePos.y - offset.y)),
          egg.whiteSize / 10
        );
        this.idToGraphicMap[egg.id] = newGraphic;
      }
    });
  }

  serverUpdate(gameState, playerId) {
    this.playerId = playerId;
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

  render() {
    if (!this.gameState) return;

    this.pixiApp.stage.removeChildren();

    const playerEgg = this.gameState.getEggById(this.playerId);
    if (playerEgg && this.playAy < playerEgg.playAy) {
      kirbyAy.pause();
      kirbyAy.currentTime = 0;
      kirbyAy.play();
      this.playAy = playerEgg.playAy;
    }

    const offset = new Vector(
      GAME.MAP_SIZE / 2 - GAME.SCREEN_SIZE / 2,
      GAME.MAP_SIZE / 2 + GAME.SCREEN_SIZE / 2
    );

    this.pixiApp.stage.addChild(
      getCircle(
        new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
        GAME.MAP_SIZE / 2,
        0x00c0ff
      )
    );

    // drawing the border - still kinda messy
    // const border = new PIXI.Graphics();
    // border.beginFill(0x808080, 0.5);
    // border.drawRect(
    //   -offset.x,
    //   offset.y,
    //   GAME.SCREEN_SIZE + GAME.MAP_SIZE,
    //   GAME.SCREEN_SIZE
    // );
    // border.drawRect(
    //   -GAME.SCREEN_SIZE - offset.x,
    //   -(GAME.SCREEN_SIZE + GAME.MAP_SIZE - offset.y),
    //   GAME.SCREEN_SIZE + GAME.MAP_SIZE,
    //   GAME.SCREEN_SIZE
    // );
    // border.drawRect(
    //   -GAME.SCREEN_SIZE - offset.x,
    //   -(GAME.MAP_SIZE - offset.y),
    //   GAME.SCREEN_SIZE,
    //   GAME.SCREEN_SIZE + GAME.MAP_SIZE
    // );
    // border.drawRect(
    //   GAME.MAP_SIZE - offset.x,
    //   -(GAME.MAP_SIZE + GAME.SCREEN_SIZE - offset.y),
    //   GAME.SCREEN_SIZE,
    //   GAME.SCREEN_SIZE + GAME.MAP_SIZE
    // );
    // border.endFill();
    // this.pixiApp.stage.addChild(border);

    for (const gummy of this.gameState.gummies) {
      const fabi = new Sprite(fabiTexture[gummy.type].icon);
      fabi.position.x = gummy.pos.x - offset.x;
      fabi.position.y = -(gummy.pos.y - offset.y);
      fabi.scale = {
        x: fabiTexture[gummy.type].scale,
        y: fabiTexture[gummy.type].scale,
      };
      fabi.anchor = { x: 0.5, y: 0.5 };
      this.pixiApp.stage.addChild(fabi);
    }

    for (const player of this.gameState.eggs) {
      if (!(player.id in this.idToGraphicMap)) {
        // create a new graphic
        this.idToGraphicMap[player.id] = new EggGraphic(
          new Vector(
            player.whitePos.x - offset.x,
            -(player.whitePos.y - offset.y)
          ),
          player.whiteSize / 10
        );
      }

      const graphic = this.idToGraphicMap[player.id];

      let color = 0xffffff;
      if ("speed" in player.state) color = 0xffc080;

      let alpha = 1;
      if ("invisible" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          alpha = 0.5;
        } else {
          alpha = 0;
        }
      }

      graphic.setPos(
        new Vector(
          player.whitePos.x - offset.x,
          -(player.whitePos.y - offset.y)
        )
      );
      graphic.setRadius(player.whiteSize / 10);
      graphic.setColor(color, alpha);
      graphic.updateAcc();
      this.pixiApp.stage.addChild(graphic);
    }

    for (const tomato of this.gameState.tomatoes) {
      this.pixiApp.stage.addChild(
        getCircle(
          new Vector(tomato.pos.x - offset.x, -(tomato.pos.y - offset.y)),
          TOMATO.SIZE,
          0xff4000
        )
      );
    }

    for (const player of this.gameState.eggs) {
      let color = 0xffc040;
      if ("spring" in player.state || "freeze" in player.state)
        color = 0xff8000;
      else if ("sprung" in player.state || "frozen" in player.state)
        color = 0xffff80;

      let alpha = 1;
      if ("invisible" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          alpha = 0.5;
        } else {
          alpha = 0;
        }
      }

      const yolk = getCircle(
        new Vector(player.yolkPos.x - offset.x, -(player.yolkPos.y - offset.y)),
        YOLK.SIZE,
        color,
        alpha
      );

      const dir = Vector.diff(player.yolkPos, player.pointerPos);

      const lenny = new PIXI.Text(player.name);
      lenny.alpha = alpha;
      lenny.anchor = { x: 0.5, y: 0.5 };
      lenny.rotation = -Math.atan2(dir.y, dir.x) + Math.PI / 2;
      yolk.addChild(lenny);

      this.pixiApp.stage.addChild(yolk);
    }
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
