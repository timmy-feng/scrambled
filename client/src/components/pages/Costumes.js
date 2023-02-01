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
const lockedEgg = "/stun-1.png";
const selectedEgg = "/eat-4.png";
const unlockedEgg = "/yolk-head.png";

const costumes = [];
for (let i = 0; i < 8; ++i) {
  costumes.push(`/costumes/cos${i}.png`);
}

const Costumes = (props) => {
  if (!props.userId) navigate("/");

  const [enabled, setEnabled] = useState(Array(8).fill(false));
  const [selected, setSelected] = useState();
  const [details, setDetails] = useState();

  useEffect(() => {
    socket.on("costumes", (result) => {
      console.log(result);
      setEnabled(result.enabled);
      setSelected(result.selected);
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
          className="Costumes-egg"
          src={
            enabled[i] ? (i == selected ? selectedEgg : unlockedEgg) : lockedEgg
          }
        />
        {i ? <img className="Costumes-costume" src={costumes[i]} /> : null}
      </div>
    );
  }

  return (
    <div className="Costumes-mainContainer u-flex">
      <div className="Costumes-secondaryContainer u-flex">
        <h2>eggcessories</h2>
        <div className="Costumes-costumeContainer">{costumeList}</div>
        {details == undefined ? null : (
          <div>
            {enabled[details] ? (
              <span>Unlocked: </span>
            ) : (
              <span className="Costumes-lockedText">LOCKED: </span>
            )}
            <span>{description[details]}</span>
          </div>
        )}
        <div className="Directions-button button-pushable u-flex u-center">
          <div>
            <span className="">
              <Link to="/">Home</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Costumes;
