import { navigate, Link } from "@reach/router";
import React, { useEffect, useRef, useState } from "react";
import { GUMMY } from "../../../../shared/constants.js";

import { removeSocketListener, socket } from "../../client-socket.js";
import GameController from "../../game/gameController.js";
import "./Game.css";

const HELP = {
  pepper: {
    name: "Pepper",
    info: "Sets you on fire, making you much faster for a short time",
  },
  garlic: {
    name: "Garlic",
    info: "Make contact with another yolk after eating to stun them with its stench",
  },
  scallion: {
    name: "Scallion",
    info: "Does nothing special - just eat this to grow bigger",
  },
  seaweed: {
    name: "Seaweed",
    info: "Is oh so tasty, but blocks your eggy vision for a bit after eating it",
  },
  fishcake: {
    name: "Fish Cake",
    info: "Make contact with another yolk after eating to make them go flying",
  },
  tomato: {
    name: "Tomato",
    info: "Click to spit it out after eating - your tomatoes are deadly to other eggs",
  },
  sarah: {
    name: "Sunglass-Side Up",
    info: "Appear invisible to other eggs for a short time",
  },
};

const fabiTexture = {
  scallion: "scallion-power.png",
  fishcake: "fishcake-power.png",
  garlic: "garlic-power.png",
  pepper: "pepper-power.png",
  sarah: "egg-power.png",
  tomato: "tomato-power.png",
  seaweed: "seaweed-power3.png",
};

const Game = (props) => {
  if (!props.userId) navigate("/");

  const canvas = useRef();
  const [game, setGame] = useState();

  const [gummy, setGummy] = useState();
  const [map, setMap] = useState();

  const processUpdate = (update) => {
    if (!map) setMap(update.map);
    game.serverUpdate(update);
  };

  // kick player out of room if they leave
  useEffect(() => {
    return () => {
      socket.emit("leavegame");
    };
  }, []);

  useEffect(() => {
    socket.on("update", (update) => processUpdate(update.gameState));
    return () => {
      removeSocketListener("update");
    };
  }, [game]);

  useEffect(() => {
    socket.on("gameover", () => {
      navigate("/results");
    });
    return () => {
      removeSocketListener("gameover");
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      setGame(new GameController(canvas.current, props.userId));
    }
  }, [canvas]);

  useEffect(() => {
    if (game) {
      const onKeyDown = (event) => game.onKeyDown(event);
      const onKeyUp = (event) => game.onKeyUp(event);

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }
  }, [game]);

  const gummyList = [];
  if (map) {
    for (const prop in GUMMY[map]) {
      gummyList.push(
        <img
          className="Game-gummyButton"
          src={fabiTexture[prop]}
          onMouseOver={() => {
            setGummy(prop);
          }}
          onMouseLeave={() => {
            setGummy(null);
          }}
        />
      );
    }
  }

  return (
    <>
      <button className="Tip-dbutton button-pushableButNotReally Tip-homeButton ">
        <span className="button-front">
          <Link to="/">Home</Link>
        </span>
      </button>

      <div className="Game-gummyContainer">{gummyList}</div>

      <div className="Game-container">
        <canvas
          className="Game-canvas"
          width="1280"
          height="1280"
          ref={canvas}
          onPointerDown={(event) => game.onPointerDown(event)}
          onPointerMove={(event) => game.onPointerMove(event)}
          onPointerUp={(event) => game.onPointerUp(event)}
          onPointerCancel={(event) => game.onPointerUp(event)}
        />
      </div>

      {gummy ? (
        <div className="Tip-container">
          <div className="Tip-title">{HELP[gummy].name}</div>
          <div className="Tip-text">{HELP[gummy].info}</div>
        </div>
      ) : null}
    </>
  );
};

export default Game;
