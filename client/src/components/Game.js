import React, { useEffect, useRef, useState } from "react";
import { socket } from "../client-socket.js";
import { Application } from "pixi.js";

import GameRender from "../game/gameRender.js";
import {
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onMouseMove,
  onMouseUp,
} from "../game/inputController.js";
import { get } from "../utilities.js";

import "./Game.css";

const Game = (props) => {
  const canvas = useRef();
  const [game, setGame] = useState();

  const [numDeaths, setNumDeaths] = useState();

  useEffect(() => {
    get("/api/numDeaths").then((result) => setNumDeaths(result.numDeaths));
  }, [props.userId]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    socket.on("update", processUpdate);
  });

  const processUpdate = (update) => {
    if (game) {
      // empty the stage if currently displaying
      if (game.stage.children.length > 0) {
        game.stage.children[0].cancelLoop();
        game.stage.removeChild(game.stage.children[0]);
      }
      game.stage.addChild(new GameRender(update));
    }
  };

  // initialize PIXI instance
  useEffect(() => {
    if (canvas) {
      setGame(
        new Application({
          view: canvas.current,
          backgroundColor: 0x40c0ff,
          width: 640,
          height: 640,
        })
      );
    }
  }, [canvas]);

  return (
    <>
      <div className="Game-container">
        <canvas
          ref={canvas}
          onMouseDown={onMouseDown}
          onMouseMove={(event) => onMouseMove(event, canvas)}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>

      {numDeaths ? (
        <div className="Game-container">
          <p>your egg has suffered {numDeaths} deaths</p>
        </div>
      ) : null}
    </>
  );
};

export default Game;
