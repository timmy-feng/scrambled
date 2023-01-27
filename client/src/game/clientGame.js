import * as PIXI from "pixi.js";
import { Sprite, Application } from "pixi.js";
import GameState from "../../../shared/gameState";

import Vector from "../../../shared/vector";
import { GAME, YOLK } from "../../../shared/constants";

const fabiTexture = PIXI.Texture.from("fabidead.png");
const kirbyAy = new Audio("kirbyAy.wav");

// const WEIGHT_OLD = 0.99;

// const getWeightedAverage = (prev, next) => {
//   return Vector.sum(
//     Vector.scale(WEIGHT_OLD, prev),
//     Vector.scale(1 - WEIGHT_OLD, next)
//   );
// };

const getCircle = (center, radius, color) => {
  const circle = new PIXI.Graphics();
  circle.beginFill(color);
  circle.drawCircle(0, 0, radius);
  circle.position = { x: center.x, y: center.y };
  return circle;
};

export default class ClientGame {
  constructor(canvas) {
    this.pixiApp = new Application({
      view: canvas,
      backgroundColor: 0x40c0ff,
      width: 640,
      height: 640,
    });

    this.renderLoop = setInterval(() => {
      if (this.gameState) {
        this.gameState.update();
        this.render();
      }
    }, 1000 / GAME.FRAMES_PER_SEC);

    // how many times we played AY
    // make sure we're not behind what the game state says
    this.playAy = 0;
  }

  serverUpdate(gameState, playerId) {
    this.playerId = playerId;
    const nextState = new GameState({ ...gameState, predictMode: true });
    // if (this.gameState) {
    //   for (const next in nextState.eggs) {
    //     const prev = this.gameState.getById(next.id);
    //     if (prev) {
    //       next.whitePos = getWeightedAverage(prev.whitePos, next.whitePos);
    //       next.yolkPos = getWeightedAverage(prev.yolkPos, next.yolkPos);
    //       next.screenPos = getWeightedAverage(prev.screenPos, next.screenPos);
    //       next.mousePos = getWeightedAverage(prev.mousePos, next.mousePos);
    //     }
    //   }
    // }
    if (!this.gameState) this.gameState = nextState;
  }

  render() {
    if (!this.gameState) return;

    this.pixiApp.stage.removeChildren();

    const playerEgg = this.gameState.getById(this.playerId);
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
      kirbyAy.play();
      this.playAy = playerEgg.playAy;
    }

    const offset = playerEgg.screenPos;

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
      const fabi = new Sprite(fabiTexture);
      fabi.position.x = gummy.x - offset.x;
      fabi.position.y = -(gummy.y - offset.y);
      fabi.scale = { x: 0.2, y: 0.2 };
      fabi.anchor = { x: 0.5, y: 0.5 };
      this.pixiApp.stage.addChild(fabi);
    }

    for (const player of this.gameState.eggs) {
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
    }

    for (const player of this.gameState.eggs) {
      const yolk = getCircle(
        new Vector(player.yolkPos.x - offset.x, -(player.yolkPos.y - offset.y)),
        YOLK.SIZE,
        0xffc040
      );

      const dir = Vector.diff(player.yolkPos, player.mousePos);

      const lenny = new PIXI.Text(player.name);
      lenny.anchor = { x: 0.5, y: 0.5 };
      lenny.rotation = -Math.atan2(dir.y, dir.x) + Math.PI / 2;
      yolk.addChild(lenny);

      this.pixiApp.stage.addChild(yolk);
    }

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
