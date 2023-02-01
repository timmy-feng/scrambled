import Vector from "../../../shared/vector";
import { GAME, YOLK, TOMATO } from "../../../shared/constants";
import EggGraphic from "./eggGraphic";
import Weed from "./weed";
import YolkGraphic from "./yolkGraphic";

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

const mapTexture = {
  rice: imageFrom("rice.png"),
  ramen: imageFrom("ramen.png"),
  shakshuka: imageFrom("shakshuka.png"),
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

    this.whiteMap = {};
    this.yolkMap = {};

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

    this.context.clearRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);
    this.drawImage(mapTexture[gameState.map], {
      center: new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
      size: GAME.SCREEN_SIZE,
    });

    // this.drawCircle(
    //   new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
    //   GAME.MAP_SIZE / 2,
    //   "#00c0ff"
    // );

    for (const gummy of gameState.gummies) {
      this.drawImage(fabiTexture[gummy.type].icon, {
        center: this.convert(gummy.pos),
        size: 100,
      });
    }

    for (const player of gameState.eggs) {
      if (!(player.id in this.whiteMap)) {
        // create a new graphic
        this.whiteMap[player.id] = new EggGraphic(
          this.convert(player.whitePos),
          player.whiteSize / 10
        );
      }

      const graphic = this.whiteMap[player.id];

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
      let yolk = this.yolkMap[player.id];
      if (!yolk) {
        yolk = this.yolkMap[player.id] = new YolkGraphic();
      }

      if ("invisible" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          yolk.setAlpha(0.5);
        } else {
          yolk.setAlpha(0);
        }
      } else {
        yolk.setAlpha(1);
      }

      yolk.setPos(this.convert(player.yolkPos));

      const dir = Vector.diff(player.yolkPos, player.pointerPos);
      yolk.setRotation(Math.PI / 2 - Math.atan2(dir.y, dir.x));

      if ("hurt" in player.state) {
        yolk.setAnim("hurt");
      } else if ("frozen" in player.state || "sprung" in player.state) {
        yolk.setAnim("stun");
      } else if ("eat" in player.state) {
        yolk.setAnim("eat");
      } else if ("shoot" in player.state) {
        yolk.setAnim("shoot");
      } else {
        yolk.setAnim("normal");
      }

      yolk.setFire("pepper" in player.state);

      yolk.render(this.context);
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

  drawImage(image, props) {
    this.context.drawImage(
      image,
      props.center.x - props.size / 2,
      props.center.y - props.size / 2,
      props.size,
      props.size
    );
  }
}
