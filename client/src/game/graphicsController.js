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
  scallion: { icon: imageFrom("scallion-power.png"), scale: 0.2 },
  fishcake: { icon: imageFrom("fishcake-power.png"), scale: 0.15 },
  garlic: { icon: imageFrom("garlic-power.png"), scale: 0.2 },
  pepper: { icon: imageFrom("pepper-power.png"), scale: 0.2 },
  sarah: { icon: imageFrom("egg-power.png"), scale: 0.15 },
  tomato: { icon: imageFrom("tomato-power.png"), scale: 0.15 },
  seaweed: { icon: imageFrom("seaweed-power.png"), scale: 0.1 },
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
    if (gameState.map == "practice") {
      const s = GAME.SCREEN_SIZE;
      this.context.strokeStyle = "#80c0ff";
      this.context.lineWidth = 2;
      this.context.beginPath();
      for (let x = 50; x < s; x += 50) {
        this.context.moveTo(
          x,
          s / 2 - Math.sqrt((s * s) / 4 - (s / 2 - x) * (s / 2 - x))
        );
        this.context.lineTo(
          x,
          s / 2 + Math.sqrt((s * s) / 4 - (s / 2 - x) * (s / 2 - x))
        );
        this.context.moveTo(
          s / 2 - Math.sqrt((s * s) / 4 - (s / 2 - x) * (s / 2 - x)),
          x
        );
        this.context.lineTo(
          s / 2 + Math.sqrt((s * s) / 4 - (s / 2 - x) * (s / 2 - x)),
          x
        );
      }
      this.context.stroke();
    } else {
      this.drawImage(mapTexture[gameState.map], {
        center: new Vector(GAME.SCREEN_SIZE / 2, GAME.SCREEN_SIZE / 2),
        size: GAME.SCREEN_SIZE,
      });
    }

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
      if ("sarah" in player.state) {
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

      this.context.fillStyle = "#ffffff";
      this.context.lineWidth = 2;
      this.context.lineStyle = "#000000";

      graphic.render(this.context);

      this.context.globalAlpha = 1;
    }

    for (const tomato of gameState.tomatoes) {
      this.drawCircle(this.convert(tomato.pos), TOMATO.SIZE, "#ff4000");
    }

    for (const player of gameState.eggs) {
      let yolk = this.yolkMap[player.id];
      if (!yolk) {
        yolk = this.yolkMap[player.id] = new YolkGraphic(player.costume);
      }

      let alpha = 1;
      if ("sarah" in player.state) {
        if (
          player.id == this.playerId ||
          "frozen" in player.state ||
          "sprung" in player.state
        ) {
          alpha = 0.5;
        } else {
          alpha = 0;
        }
      } else {
        alpha = 1;
      }

      yolk.setAlpha(alpha);
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

      this.context.globalAlpha = alpha;

      if ("garlic" in player.state) {
        this.drawImage(fabiTexture.garlic.icon, {
          center: Vector.sum(
            this.convert(player.yolkPos),
            new Vector(YOLK.SIZE, YOLK.SIZE)
          ),
          size: 50,
        });
      }

      if ("fishcake" in player.state) {
        this.drawImage(fabiTexture.fishcake.icon, {
          center: Vector.sum(
            this.convert(player.yolkPos),
            new Vector(YOLK.SIZE, YOLK.SIZE)
          ),
          size: 50,
        });
      }

      if ("tomato" in player.state) {
        this.drawImage(fabiTexture.tomato.icon, {
          center: Vector.sum(
            this.convert(player.yolkPos),
            new Vector(-YOLK.SIZE, YOLK.SIZE)
          ),
          size: 50,
        });
      }
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
      this.context.fillStyle = "#ffffff";
      this.context.fillRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);
      this.context.globalAlpha = 1;
      this.context.fillStyle = "#000000";
      this.context.font = "72px Arial bold";
      this.context.fillText(
        "YOU CRACKED",
        GAME.SCREEN_SIZE / 2,
        GAME.SCREEN_SIZE / 2
      );
    } else if (this.panelState == 4) {
      // game over panel
      this.context.globalAlpha = 0.5;
      this.context.fillStyle = "#ffffff";
      this.context.fillRect(0, 0, GAME.SCREEN_SIZE, GAME.SCREEN_SIZE);
      this.context.globalAlpha = 1;
      this.context.fillStyle = "#000000";
      this.context.font = "72px Arial bold";
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
