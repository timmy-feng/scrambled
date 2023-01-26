import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";

const MAP_SIZE = 1280;
const SCREEN_SIZE = 640;
const YOLK_SIZE = 48;
const GUMMY_SIZE = 12;

const fabiTexture = PIXI.Texture.from("fabidead.png");

export default class GameState extends PIXI.Container {
  constructor({ players, gummies, you }) {
    super();

    if (!you) {
      const gameOverText = new PIXI.Text("Game Over | Reload to Try Again?", {
        fontFamily: "Comic Sans MS",
        fontSize: 36,
      });
      gameOverText.anchor = { x: 0.5, y: 0.5 };
      gameOverText.position = { x: SCREEN_SIZE / 2, y: SCREEN_SIZE / 2 };
      this.addChild(gameOverText);
    } else {
      const offset = you.screenPos;

      // drawing the border - still kinda messy
      const border = new PIXI.Graphics();
      border.beginFill(0x808080, 0.5);
      border.drawRect(-offset.x, offset.y, SCREEN_SIZE + MAP_SIZE, SCREEN_SIZE);
      border.drawRect(
        -SCREEN_SIZE - offset.x,
        -(SCREEN_SIZE + MAP_SIZE - offset.y),
        SCREEN_SIZE + MAP_SIZE,
        SCREEN_SIZE
      );
      border.drawRect(
        -SCREEN_SIZE - offset.x,
        -(MAP_SIZE - offset.y),
        SCREEN_SIZE,
        SCREEN_SIZE + MAP_SIZE
      );
      border.drawRect(
        MAP_SIZE - offset.x,
        -(MAP_SIZE + SCREEN_SIZE - offset.y),
        SCREEN_SIZE,
        SCREEN_SIZE + MAP_SIZE
      );
      border.endFill();
      this.addChild(border);

      for (const gummy of gummies) {
        const fabi = new Sprite(fabiTexture);
        fabi.position.x = gummy.x - offset.x;
        fabi.position.y = -(gummy.y - offset.y);
        fabi.scale = { x: 0.2, y: 0.2 };
        fabi.anchor = { x: 0.5, y: 0.5 };
        this.addChild(fabi);
      }

      for (const player of Object.values(players)) {
        this.drawCircle(
          new Vector(
            player.whitePos.x - offset.x,
            -(player.whitePos.y - offset.y)
          ),
          player.whiteSize / 10,
          0xffffff
        );
      }

      for (const player of Object.values(players)) {
        const yolk = this.drawCircle(
          new Vector(
            player.yolkPos.x - offset.x,
            -(player.yolkPos.y - offset.y)
          ),
          YOLK_SIZE,
          player.defensiveMode ? 0xff8000 : 0xffc040
        );

        const lenny = new PIXI.Text(player.name);
        lenny.anchor = { x: 0.5, y: 0.5 };
        yolk.addChild(lenny);
      }
    }
  }

  drawCircle(center, radius, color) {
    const circle = new PIXI.Graphics();
    circle.beginFill(color);
    circle.drawCircle(center.x, center.y, radius);
    this.addChild(circle);
    return circle;
  }
}
