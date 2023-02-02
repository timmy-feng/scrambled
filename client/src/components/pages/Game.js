import { navigate } from "@reach/router";
import React, { useEffect, useRef, useState } from "react";

import {
  removeSocketListener,
  socket,
  socketPing,
} from "../../client-socket.js";
import GameController from "../../game/gameController.js";
import "./Game.css";

const Game = (props) => {
  if (!props.userId) navigate("/");

  const canvas = useRef();
  const [game, setGame] = useState();

  const processUpdate = (update) => {
    game.serverUpdate(update.gameState, update.playerId);
  };

  // kick player out of room if they leave
  useEffect(() => {
    return () => {
      socket.emit("leavegame");
    };
  }, []);

  useEffect(() => {
    socket.on("update", (update) => processUpdate(update));
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

  return (
    <>
      <div className="Game-container" style={{backgroundColor: "#"}}>
        
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
    </>
  );
};

export default Game;
