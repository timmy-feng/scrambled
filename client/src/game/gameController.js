import * as PIXI from "pixi.js";
import { Sprite, Application } from "pixi.js";
import GameState from "../../../shared/gameState";

import Vector from "../../../shared/vector";
import { GAME, YOLK } from "../../../shared/constants";
import EggGraphic from "./eggGraphic";

const fabiTexture = {
  gummy: { icon: PIXI.Texture.from("fabidead.png"), scale: 0.2 },
  spring: { icon: PIXI.Texture.from("fabiboing.png"), scale: 0.15 },
  freeze: { icon: PIXI.Texture.from("fabifreeze.png"), scale: 0.15 },
};

const kirbyAy = new Audio("kirbyAy.wav");

// when client and server states are different,
// use weighted average for smoothing
const WEIGHT_OLD = 0.99;

// since udp has no guarantee on packet ordering
// if a packet is sent too many frames in the past,
// we discard it
const MAX_FRAME_JUMP = 3;

const getWeightedAverage = (prev, next) => {
  return Vector.sum(
    Vector.scale(WEIGHT_OLD, prev),
    Vector.scale(1 - WEIGHT_OLD, next)
  );
};

const getCircle = (center, radius, color) => {
  const circle = new PIXI.Graphics();
  circle.beginFill(color);
  circle.drawCircle(0, 0, radius);
  circle.position = { x: center.x, y: center.y };
  return circle;
};

export default class GameController {
  constructor(canvas) {
    this.pixiApp = new Application({
      view: canvas,
      backgroundColor: 0x40c0ff,
      width: GAME.SCREEN_SIZE,
      height: GAME.SCREEN_SIZE,
    });

    this.eggIdToGraphic = {};

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
      if (!this.eggIdToGraphic.hasOwnProperty(egg.id)) {
        // create a new graphic
        let newGraphic = new EggGraphic({
          pos: new Vector(
            egg.whitePos.x - offset.x,
            -(egg.whitePos.y - offset.y)
          ),
        });
        this.eggIdToGraphic[egg.id] = newGraphic;
      }
    });
  }

  serverUpdate(gameState, playerId) {
    this.playerId = playerId;
    const nextState = new GameState({ ...gameState, predictMode: true });
    if (this.gameState) {
      if (nextState.framesPassed + MAX_FRAME_JUMP < this.gameState.framesPassed)
        return;
      // while (
      //   nextState.framesPassed + MAX_FRAME_JUMP <
      //   this.gameState.framesPassed
      // ) {
      //   nextState.update();
      // }

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
    if (!playerEgg) {
      const gameOverText = new PIXI.Text("Game Over | Reload to Try Again?", {
        fontFamily: "Comic Sans MS",
        fontSize: 36,
      });
      gameOverText.anchor = { x: 0.5, y: 0.5 };
      gameOverText.position = {
        x: GAME.SCREEN_SIZE / 2,
        y: GAME.SCREEN_SIZE / 2,
      };
      this.pixiApp.stage.addChild(gameOverText);
      return;
    }

    if (this.playAy < playerEgg.playAy) {
      kirbyAy.pause();
      kirbyAy.currentTime = 0;
      kirbyAy.play();
      this.playAy = playerEgg.playAy;
    }

    const offset = new Vector(
      GAME.MAP_SIZE / 2 - GAME.SCREEN_SIZE / 2,
      GAME.MAP_SIZE / 2 + GAME.SCREEN_SIZE / 2
    );

    // drawing the border - still kinda messy
    const border = new PIXI.Graphics();
    border.beginFill(0x808080, 0.5);
    border.drawRect(
      -offset.x,
      offset.y,
      GAME.SCREEN_SIZE + GAME.MAP_SIZE,
      GAME.SCREEN_SIZE
    );
    border.drawRect(
      -GAME.SCREEN_SIZE - offset.x,
      -(GAME.SCREEN_SIZE + GAME.MAP_SIZE - offset.y),
      GAME.SCREEN_SIZE + GAME.MAP_SIZE,
      GAME.SCREEN_SIZE
    );
    border.drawRect(
      -GAME.SCREEN_SIZE - offset.x,
      -(GAME.MAP_SIZE - offset.y),
      GAME.SCREEN_SIZE,
      GAME.SCREEN_SIZE + GAME.MAP_SIZE
    );
    border.drawRect(
      GAME.MAP_SIZE - offset.x,
      -(GAME.MAP_SIZE + GAME.SCREEN_SIZE - offset.y),
      GAME.SCREEN_SIZE,
      GAME.SCREEN_SIZE + GAME.MAP_SIZE
    );
    border.endFill();
    this.pixiApp.stage.addChild(border);

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

    for (const eggId in this.eggIdToGraphic) {
      const egg = this.gameState.getEggById(eggId);

      this.eggIdToGraphic[eggId].setPos(
        new Vector(egg.whitePos.x - offset.x, -(egg.whitePos.y - offset.y))
      );
      this.eggIdToGraphic[eggId].updateAcc();
      this.pixiApp.stage.addChild(this.eggIdToGraphic[eggId]);
    }

    /* for (const player of this.gameState.eggs) {
      this.pixiApp.stage.addChild(
        getCircle(
          new Vector(
            player.whitePos.x - offset.x,
            -(player.whitePos.y - offset.y)
          ),
          player.whiteSize / 10,
          0xffffff
        )
      );
    } */

    /* for (const player of this.gameState.eggs) {
      let color = 0xffc040;
      if ("spring" in player.state || "freeze" in player.state)
        color = 0xff8000;
      else if ("sprung" in player.state || "frozen" in player.state)
        color = 0xffff80;

      const yolk = getCircle(
        new Vector(player.yolkPos.x - offset.x, -(player.yolkPos.y - offset.y)),
        YOLK.SIZE,
        color
      );

      const dir = Vector.diff(player.yolkPos, player.pointerPos);

      const lenny = new PIXI.Text(player.name);
      lenny.anchor = { x: 0.5, y: 0.5 };
      lenny.rotation = -Math.atan2(dir.y, dir.x) + Math.PI / 2;
      yolk.addChild(lenny);

      this.pixiApp.stage.addChild(yolk);
    } */

    // for (const wave of this.gameState.waves) {
    //   this.pixiApp.stage.addChild(
    //     getCircle(
    //       new Vector(wave.pos.x - offset.x, -(wave.pos.y - offset.y)),
    //       20,
    //       0x00ff00
    //     )
    //   );
    // }
  }
}
