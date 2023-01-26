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
        /*
        const yum = new PIXI.Graphics();
        yum.beginFill(0xffc0ff);
        yum.drawCircle(0, 0, GUMMY_SIZE);
        yum.endFill();
        yum.position.x = gummy.x - offset.x;
        yum.position.y = -(gummy.y - offset.y);
        this.addChild(yum);
        */

        const fabi = new Sprite(fabiTexture);
        fabi.position.x = gummy.x - offset.x;
        fabi.position.y = -(gummy.y - offset.y);
        fabi.scale = { x: 0.2, y: 0.2 };
        fabi.anchor = { x: 0.5, y: 0.5 };
        this.addChild(fabi);
      }

      for (const player of Object.values(players)) {
        const white = new PIXI.Graphics();
        white.beginFill(0xffffff);
        white.drawCircle(0, 0, player.whiteSize / 10);
        white.endFill();
        white.position.x = player.whitePos.x - offset.x;
        white.position.y = -(player.whitePos.y - offset.y);
        this.addChild(white);
      }

      for (const player of Object.values(players)) {
        const yolk = new PIXI.Graphics();
        yolk.beginFill(player.defensiveMode ? 0xff8000 : 0xffc040);
        yolk.drawCircle(0, 0, YOLK_SIZE);
        yolk.endFill();
        yolk.position.x = player.yolkPos.x - offset.x;
        yolk.position.y = -(player.yolkPos.y - offset.y);
        this.addChild(yolk);

        const lenny = new PIXI.Text(player.name);
        lenny.anchor = { x: 0.5, y: 0.5 };
        yolk.addChild(lenny);
      }
    }
  }
}
