import { navigate } from "@reach/router";
import React, { useEffect, useRef, useState } from "react";

import {
  removeSocketListener,
  socket,
  socketPing,
} from "../../client-socket.js";
import GameController from "../../game/gameController.js";
import "./Game.css";
import Joystick from "../features/Joystick.js";

const Game = (props) => {
  if (!props.userId) navigate("/");

  const canvas = useRef();
  const [game, setGame] = useState();

  const [ping, setPing] = useState();

  const processUpdate = (update) => {
    game.serverUpdate(update.gameState, update.playerId);
  };

  useEffect(() => {
    socket.on("update", (update) => processUpdate(update));
    return () => {
      removeSocketListener("update");
    };
  }, [game]);

  // kick player out of room if they leave
  useEffect(() => {
    socket.on("gameover", (winner) => {
      window.alert(`${winner} won!`);
      navigate("/lobby");
    });
    return () => {
      removeSocketListener("gameover");
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
    if (canvas) {
      setGame(new GameController(canvas.current));
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

  return (
    <>
      <div className="Game-container">
        <canvas
          ref={canvas}
          onPointerDown={(event) => game.onPointerDown(event)}
          onPointerMove={(event) => game.onPointerMove(event)}
          onPointerUp={(event) => game.onPointerUp(event)}
          onPointerCancel={(event) => game.onPointerUp(event)}
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
