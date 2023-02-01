import Vector from "../../../shared/vector";
import { GAME, YOLK, TOMATO } from "../../../shared/constants";
import EggGraphic from "./eggGraphic";
import Weed from "./weed";

const imageFrom = (src) => {
  const image = new Image();
  image.src = src;
  return image;
};

const fabiTexture = {
  gummy: { icon: imageFrom("fabidead.png"), scale: 0.2 },
  spring: { icon: imageFrom("fabiboing.png"), scale: 0.15 },
  freeze: { icon: imageFrom("fabifreeze.png"), scale: 0.15 },
  speed: { icon: imageFrom("fabispice.png"), scale: 0.15 },
  invisible: { icon: imageFrom("fabicloak.png"), scale: 0.15 },
  armed: { icon: imageFrom("fa-b-ball.png"), scale: 0.15 },
  seaweed: { icon: imageFrom("fabisees.png"), scale: 0.15 },
};

const kirbyAy = new Audio("kirbyAy.wav");

export default class GraphicsController {
  constructor(context, playerId) {
    this.context = context;
    this.context.textAlign = "center";

    this.playerId = playerId;

    // 0 nothing
    // 1 player dead
    // 2 player dead (click to exit)
    // 3 nothing
    // 4 game over
    this.panelState = 0;

    this.weeds = [];

    this.idToGraphicMap = {};

    this.offset = new Vector(
      GAME.MAP_SIZE / 2 - GAME.SCREEN_SIZE / 2,
      GAME.MAP_SIZE / 2 + GAME.SCREEN_SIZE / 2
    );
  }

  convert(pos) {
    return new Vector(pos.x - this.offset.x, -(pos.y - this.offset.y));
  }

  render(gameState) {
    const playerEgg = gameState.getEggById(this.playerId);
    if (playerEgg && this.playAy < playerEgg.playAy) {
      kirbyAy.pause();
      kirbyAy.currentTime = 0;
      kirbyAy.play();
      this.playAy = playerEgg.playAy;
    }

    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);

    this.drawCircle(
      new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
      GAME.MAP_SIZE / 2,
      "#00c0ff"
    );

    for (const gummy of gameState.gummies) {
      this.drawImage(fabiTexture[gummy.type].icon, this.convert(gummy.pos));
    }

    for (const player of gameState.eggs) {
      if (!(player.id in this.idToGraphicMap)) {
        // create a new graphic
        this.idToGraphicMap[player.id] = new EggGraphic(
          this.convert(player.whitePos),
          player.whiteSize / 10
        );
      }

      const graphic = this.idToGraphicMap[player.id];

      let color = "#ffffff";
      if ("speed" in player.state) color = "#ffc080";

      if ("invisible" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          this.context.globalAlpha = 0.5;
        } else {
          this.context.globalAlpha = 0;
        }
      }

      graphic.setPos(this.convert(player.whitePos));
      graphic.setRadius(player.whiteSize / 10);
      graphic.updateAcc();

      this.context.fillStyle = color;

      graphic.render(this.context);

      this.context.globalAlpha = 1;
    }

    for (const tomato of gameState.tomatoes) {
      this.drawCircle(this.convert(tomato.pos), TOMATO.SIZE, "#ff4000");
    }

    for (const player of gameState.eggs) {
      let color = "#ffc040";
      if ("spring" in player.state || "freeze" in player.state)
        color = "#ff8000";
      else if ("sprung" in player.state || "frozen" in player.state)
        color = "#ffff80";

      if ("invisible" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          this.context.globalAlpha = 0.5;
        } else {
          this.context.globalAlpha = 0;
        }
      }

      const pos = this.convert(player.yolkPos);
      this.drawCircle(pos, YOLK.SIZE, color);

      const dir = Vector.diff(player.yolkPos, player.pointerPos);

      this.context.save();
      this.context.translate(pos.x, pos.y);
      this.context.rotate(Math.PI / 2 - Math.atan2(dir.y, dir.x));
      this.context.fillStyle = "#000000";
      this.context.font = "24px arial";
      this.context.fillText(player.name, 0, 0);
      this.context.restore();

      this.context.globalAlpha = 1;
    }

    if (playerEgg && "seaweed" in playerEgg.state) {
      if (Math.random() < 1 / 10) this.weeds.push(new Weed());
    }

    if (this.weeds.length > 0) console.log(this.weeds);
    const dead = [];
    for (const weed of this.weeds) {
      weed.render(this.context);
      if (weed.duration <= 0) {
        dead.push(weed);
      }
    }
    for (const weed in dead) {
      this.weeds.splice(this.weeds.indexOf(weed), 1);
    }

    if (gameState.isGameOver()) {
      this.panelState = 4;
    }

    if (!playerEgg && this.panelState == 0) {
      this.panelState = 1;
      setTimeout(() => (this.panelState = 2), 1000);
    }

    if (this.panelState == 1 || this.panelState == 2) {
      // egg dead panel
      this.context.globalAlpha = 0.5;
      this.context.fillStyle = "#ff4000";
      this.context.fillRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);
      this.context.globalAlpha = 1;
      this.context.fillStyle = "#000000";
      this.context.font = "72px arial bold";
      this.context.fillText(
        "YOU CRACKED",
        GAME.SCREEN_SIZE / 2,
        GAME.SCREEN_SIZE / 2
      );
    } else if (this.panelState == 4) {
      // game over panel
      this.context.globalAlpha = 0.5;
      this.context.fillStyle = "#00ff40";
      this.context.fillRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);
      this.context.globalAlpha = 1;
      this.context.fillStyle = "#000000";
      this.context.font = "72px arial bold";
      this.context.fillText(
        "GAME OVER",
        GAME.SCREEN_SIZE / 2,
        GAME.SCREEN_SIZE / 2
      );
    }
  }

  drawCircle(center, radius, color) {
    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  drawImage(image, center) {
    this.context.drawImage(image, center.x - 50, center.y - 50, 100, 100);
  }
}
