import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";
import Mascot from "../features/Mascot";

import "./Results.css";

const statIcons = {
  fishcake: "fishcake-power.png",
  garlic: "garlic-power.png",
  pepper: "pepper-power.png",
  scallion: "scallion-power.png",
  seaweed: "seaweed-power.png",
  tomato: "tomato-power.png",
  sarah: "egg-power.png",
  kill: "stun-1.png",
};

const Results = (props) => {
  if (!props.userId) navigate("/");

  const [result, setResults] = useState();

  useEffect(() => {
    socket.on("results", (results) => {
      if (!results) navigate("/");
      setResults(results);
    });

    socket.emit("requestresults");

    return () => {
      removeSocketListener("results");
    };
  }, []);

  if (!result) return null;

  const statList = [];
  for (const stat in result.stats) {
    statList.push(
      <div key={stat}>
        <img className="Results-icon" src={statIcons[stat]} />
        <span className="Results-count"> x {result.stats[stat]}</span>
      </div>
    );
  }

  return (
    <div className="Start-container u-flex">
      <div className="Directions-container u-flex">
        <div className="Title-container u-flex">
          <h2 className="Title-text">
            {result.won ? "Eggceptional!" : "Cracked Under Pressure?"}
          </h2>
        </div>
        <Mascot name={result.user.name} costume={result.user.costume} />
        <div className="Results-statContainer">{statList}</div>
        <div className="Escape-container u-split buttons u-flex u-space-between ">
          <button
            className="Split-button button-pushable"
            onClick={() => socket.emit("leaveroom")}
          >
            <span className=" button-front">
              <Link to="/lobby">Lobby</Link>
            </span>
          </button>
          <button className="Split-button button-pushable">
            <span className="button-front">
              <Link to="/">Home</Link>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
