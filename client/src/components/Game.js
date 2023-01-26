import React, { useEffect, useRef, useState } from "react";
import {
  moveWhite,
  movePtr,
  setClick,
  socket,
  setSpacebar,
} from "../client-socket.js";
import { Application } from "pixi.js";

import GameState from "../game/gameState.js";
import "./Game.css";
import { get } from "../utilities.js";

const MAP_SIZE = 1280;
const SCREEN_SIZE = 640;

const keyToMove = {
  ArrowUp: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: -1 },
  ArrowRight: { x: 1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  w: { x: 0, y: 1 },
  s: { x: 0, y: -1 },
  d: { x: 1, y: 0 },
  a: { x: -1, y: 0 },
};

const onKeyDown = (event) => {
  if (event.repeat) return;
  if (event.key == " ") setSpacebar(true);
  else if (keyToMove[event.key]) moveWhite(keyToMove[event.key]);
};

const onKeyUp = (event) => {
  if (event.key == " ") setSpacebar(false);
  else if (keyToMove[event.key])
    moveWhite({
      x: -keyToMove[event.key].x,
      y: -keyToMove[event.key].y,
    });
};

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

  const processUpdate = (gameState) => {
    if (game) {
      if (game.stage.children.length > 0) {
        game.stage.removeChild(game.stage.children[0]);
      }
      game.stage.addChild(new GameState(gameState));
    }
  };

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

  const handleMouseDown = () => setClick(true);
  const handleMouseUp = () => setClick(false);

  const handleMouseMove = (event) => {
    const rect = canvas.current.getBoundingClientRect();
    movePtr({
      x: event.clientX - rect.left,
      y: -(event.clientY - rect.top),
    });
  };

  return (
    <>
      <div className="Game-container">
        <canvas
          ref={canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
