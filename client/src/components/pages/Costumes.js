import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import "./Costumes.css";

const description = [
  "Plain and Simple",
  "Play Your First Game",
  "Play 50 Games",
  "Get 10 Kills",
  "Get 100 Kills",
  "Eat 50 Seaweed",
  "Eat 500 Scallion",
  "Eat 500 Fish Cakes",
];

// pics
const lockedEgg = Array(8).fill("/stun-1.png");
const selectedEgg = Array(8).fill("/eat-4.png");
const unlockedEgg = Array(8).fill("/yolk-head.png");

const Costumes = (props) => {
  if (!props.userId) navigate("/");

  const [enabled, setEnabled] = useState([
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    false,
  ]);
  const [selected, setSelected] = useState(0);
  const [details, setDetails] = useState();

  useEffect(() => {
    socket.on("costumes", (enabledEggs) => {
      setEnabled(enabledEggs);
    });

    socket.emit("requestcostumes");

    return () => {
      removeSocketListener("costumes");
    };
  }, []);

  const costumeList = [];
  for (let i = 0; i < 8; i++) {
    costumeList.push(
      <div
        className="Costumes-button"
        onClick={() => {
          setDetails(i);
          if (enabled[i]) {
            setSelected(i);
            socket.emit("setcostume", i);
          }
        }}
      >
        <img
          className="Costumes-icon"
          src={
            enabled[i]
              ? i == selected
                ? selectedEgg[i]
                : unlockedEgg[i]
              : lockedEgg[i]
          }
        />
      </div>
    );
  }

  return (
    <div>
      <h2>eggcessories</h2>
      <div className="Costumes-costumeContainer">{costumeList}</div>
      {details ? (
        <div>
          {enabled[details] ? (
            <span>Unlocked: </span>
          ) : (
            <span className="Costumes-lockedText">LOCKED: </span>
          )}
          <span>{description[details]}</span>
        </div>
      ) : null}
      <Link to="/">home</Link>
    </div>
  );
};

export default Costumes;
