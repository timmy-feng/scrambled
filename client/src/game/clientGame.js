import * as PIXI from "pixi.js";
import { Sprite, Application } from "pixi.js";
import GameState from "../../../shared/gameState";

import Vector from "../../../shared/vector";
import { GAME, YOLK } from "../../../shared/constants";

const fabiTexture = PIXI.Texture.from("fabidead.png");

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

    this.renderLoop = setInterval(
      () => this.render(),
      1000 / GAME.FRAMES_PER_SEC
    );
  }

  serverUpdate(gameState, playerId) {
    this.gameState = new GameState({ ...gameState, predictMode: true });
    this.playerId = playerId;

    if (this.predictLoop) clearInterval(this.predictLoop);
    this.predictLoop = setInterval(
      () => this.gameState.update(),
      1000 / GAME.FRAMES_PER_SEC
    );
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

      const lenny = new PIXI.Text(player.name);
      lenny.anchor = { x: 0.5, y: 0.5 };
      yolk.addChild(lenny);

      this.pixiApp.stage.addChild(yolk);
    }
  }
}
