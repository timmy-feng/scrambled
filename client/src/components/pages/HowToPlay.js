import { navigate, Link } from "@reach/router";
import React, { useEffect, useState, useRef } from "react";

import GameController from "../../game/gameController";
import GameState from "../../../../shared/gameState";
import "./Game.css";
import { ARROW_CODE, GAME } from "../../../../shared/constants";

import "./HowToPlay.css";

const messages = [
  "Hey look, it's you!",
  "You're an egg today!",
  "Move your white with the WASD keys.",
  "Move your yolk by clicking and dragging.",
  "Your yolk can eat foods to help you grow.",
  "Look out for special foods that do special things!",
  "Push your yolk into another egg's whites to take a bite.",
  "Lose too much white and you will cease to exist.",
  "Good luck in the real world!",
];

const HowToPlay = (props) => {
  if (!props.userId) navigate("/");

  const canvas = useRef();
  const game = useRef();

  const [message, setMessage] = useState(0);
  const furthest = useRef(-1);

  useEffect(() => {
    if (canvas) {
      const controller = new GameController(canvas.current, props.userId);

      const gameState = new GameState({ map: "practice" });
      gameState.spawnEgg(props.userId, 0);
      controller.serverUpdate(gameState);

      const onKeyDown = (event) => controller.onKeyDown(event);
      const onKeyUp = (event) => controller.onKeyUp(event);

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      game.current = controller;

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }
  }, [canvas]);

  useEffect(() => {
    if (
      (message == 0 || message == 1 || message == 5 || message == 7) &&
      message > furthest.current
    ) {
      setTimeout(() => {
        setMessage(message + 1);
      }, 3000);
    }

    if (message == 5 && furthest.current < 5) {
      setInterval(() => {
        const gameState = game.current.gameState;
        if (gameState.eggs.length == 1) {
          gameState.spawnEgg(Date.now().toString(), 0);
        }
      }, 3000);
    }

    furthest.current = Math.max(furthest.current, message);

    if (message == 2 && furthest.current == 2) {
      const onKeyDown = (event) => {
        if (event.key in ARROW_CODE) {
          setTimeout(() => {
            setMessage(3);
          }, 3000);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
      };
    }

    if (message == 4 && furthest.current == 4) {
      game.current.gameState.predictMode = false;
      game.current.addEventListener("scallion", () => {
        setTimeout(() => {
          setMessage(5);
        }, 3000);
      });
      return () => {
        game.current.removeEventListener("scallion");
      };
    }

    if (message == 6 && furthest.current == 6) {
      game.current.addEventListener("kill", () => {
        setTimeout(() => {
          setMessage(7);
        }, 3000);
      });
      return () => {
        game.current.removeEventListener("kill");
      };
    }
  }, [message]);

  return (
    <>
      <button className="Tip-dbutton button-pushableButNotReally Tip-homeButton ">
        <span className="button-front">
          <Link to="/">Home</Link>
        </span>
      </button>

      <div className="Game-container">
        <canvas
          className="Game-canvas"
          width="1280"
          height="1280"
          ref={canvas}
          onPointerDown={(event) => {
            if (message == 3 && furthest.current == 3) {
              setTimeout(() => {
                setMessage(4);
              }, 3000);
            }
            game.current.onPointerDown(event);
          }}
          onPointerMove={(event) => game.current.onPointerMove(event)}
          onPointerUp={(event) => game.current.onPointerUp(event)}
          onPointerCancel={(event) => game.current.onPointerUp(event)}
        />
      </div>

      {message < messages.length ? (
        <div className="Tip-container">
          <div className="Tip-title">Tips</div>
          <div className="Tip-text">{messages[message]}</div>
          <div className="Tip-columns">
            <div className="u-transparent">
              <button
                className="Tip-button Directions-button button-pushable"
                onClick={() => {
                  if (message) setMessage(message - 1);
                }}
              >
                <span className="button-front">{"<"}</span>
              </button>
            </div>
            <div className="u-margin-top Tip-text">
              {message + 1}/{messages.length}
            </div>
            <div className="u-transparent">
              <button
                className="Tip-button Directions-button button-pushable"
                onClick={() => {
                  if (message < furthest.current) setMessage(message + 1);
                }}
              >
                <span className="button-front">{">"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default HowToPlay;
