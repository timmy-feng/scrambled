import React, { useEffect, useRef, useState } from "react";
import { socket } from "../client-socket.js";

import ClientGame from "../game/clientGame.js";
import InputController from "../game/inputController.js";
import { get } from "../utilities.js";

import "./Game.css";

const Game = (props) => {
  const canvas = useRef();
  const [game, setGame] = useState();
  const [input, setInput] = useState();

  const [numDeaths, setNumDeaths] = useState();

  useEffect(() => {
    get("/api/numDeaths").then((result) => setNumDeaths(result.numDeaths));
  }, [props.userId]);

  useEffect(() => {
    if (input) {
      const tempInput = input;
      // TODO: figure out scope of event listener
      window.addEventListener("keydown", (event) => tempInput.onKeyDown(event));
      window.addEventListener("keyup", (event) => tempInput.onKeyUp(event));
    }
  }, [input]);

  useEffect(() => {
    socket.on("update", processUpdate);
  });

  const processUpdate = (update) => {
    if (game) game.serverUpdate(update.gameState, update.playerId);
  };

  // initialize PIXI instance
  useEffect(() => {
    if (canvas) {
      setGame(new ClientGame(canvas.current));
    }
  }, [canvas]);

  useEffect(() => {
    if (game) {
      setInput(new InputController(game));
    }
  }, [game]);

  return (
    <>
      <div className="Game-container">
        <canvas
          ref={canvas}
          onMouseDown={(event) => input?.onMouseDown(event)}
          onMouseMove={(event) => input?.onMouseMove(event, canvas)}
          onMouseUp={(event) => input?.onMouseUp(event)}
          onMouseLeave={(event) => input?.onMouseUp(event)}
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
