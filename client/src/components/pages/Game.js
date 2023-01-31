import React, { useEffect, useRef, useState } from "react";
import { socket, socketPing } from "../../client-socket.js";

import GameController from "../../game/gameController.js";
import InputController from "../../game/inputController.js";

import "./Game.css";
import Joystick from "../features/Joystick.js";
import { navigate } from "@reach/router";

const Game = (props) => {
  if (!props.userId) navigate("/");

  const canvas = useRef();
  const [game, setGame] = useState();
  const [input, setInput] = useState();

  const [ping, setPing] = useState();

  // kick player out of room if they leave
  useEffect(() => {
    return () => {
      socket.emit("leaveroom");
    };
  }, []);

  useEffect(() => {
    const pingLoop = setInterval(() => {
      setPing(Math.floor(socketPing));
    }, 1000);
    return () => {
      clearInterval(pingLoop);
    };
  }, []);

  useEffect(() => {
    if (input) {
      const tempInput = input;
      // TODO: figure out scope of event listener
      window.addEventListener("keydown", (event) => tempInput.onKeyDown(event));
      window.addEventListener("keyup", (event) => tempInput.onKeyUp(event));
    }
  }, [input]);

  useEffect(() => {
    if (game) {
      socket.on("update", processUpdate);
    }
  }, [game]);

  const processUpdate = (update) => {
    if (game) game.serverUpdate(update.gameState, update.playerId);
  };

  // initialize PIXI instance
  useEffect(() => {
    if (canvas) {
      setGame(new GameController(canvas.current));
    }
  }, [canvas]);

  useEffect(() => {
    if (game) {
      setInput(new InputController(game, canvas));
    }
  }, [game]);

  return (
    <>
      <div className="Game-container">
        <canvas
          ref={canvas}
          onPointerDown={(event) => input?.onPointerDown(event)}
          onPointerMove={(event) => input?.onPointerMove(event, canvas)}
          onPointerUp={(event) => input?.onPointerUp(event)}
          onPointerCancel={(event) => input?.onPointerUp(event)}
        />
      </div>

      <div className="Game-container">
        <Joystick game={game}></Joystick>
      </div>

      {ping ? (
        <div className="Game-container">
          <p>ping {ping}</p>
        </div>
      ) : null}
    </>
  );
};

export default Game;
