import Vector from "../../../shared/vector";
import { GAME, YOLK, TOMATO } from "../../../shared/constants";
import EggGraphic from "./eggGraphic";

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
};

const kirbyAy = new Audio("kirbyAy.wav");

export default class GraphicsController {
  constructor(context, playerId) {
    this.context = context;
    this.playerId = playerId;

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
      this.context.textAlign = "center";
      this.context.font = "24px arial";
      this.context.fillStyle = "#000000";
      this.context.fillText(player.name, 0, 0);
      this.context.restore();

      this.context.globalAlpha = 1;
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
