import React, { useEffect, useRef, useState } from "react";
import { socket, socketPing } from "../client-socket.js";

import ClientGame from "../game/clientGame.js";
import InputController from "../game/inputController.js";
import { get } from "../utilities.js";

import "./Game.css";

const Game = (props) => {
  const canvas = useRef();
  const [game, setGame] = useState();
  const [input, setInput] = useState();

  useEffect(() => {
    setInterval(() => {
      console.log(game);
    }, 5000);
  }, [game]);

  const [numDeaths, setNumDeaths] = useState();
  const [ping, setPing] = useState();

  const [updateTime, setUpdateTime] = useState();
  const [updateDiff, setUpdateDiff] = useState();

  // useEffect(() => {
  //   setInterval(() => {
  //     if (updateTime) {
  //       setUpdateDiff(Date.now() - updateTime);
  //     }
  //   }, 1000 / 60);
  // }, [updateTime]);

  useEffect(() => {
    get("/api/numDeaths").then((result) => setNumDeaths(result.numDeaths));
  }, [props.userId]);

  useEffect(() => {
    const pingLoop = setInterval(() => {
      setPing(Math.floor(socketPing));
      // console.log(input);
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
    socket.on("update", processUpdate);
  });

  const processUpdate = (update) => {
    setUpdateTime(Date.now());
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

      {ping ? (
        <div className="Game-container">
          <p>ping {ping}</p>
        </div>
      ) : null}

      {updateDiff ? (
        <div className="Game-container">
          <p>last update {updateDiff} ms ago</p>
        </div>
      ) : null}
    </>
  );
};

export default Game;
