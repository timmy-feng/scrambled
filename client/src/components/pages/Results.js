import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import "./Skeleton.css";

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
        x{result.stats[stat]} | {stat}
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
        <div className="Directions-button">{result.user.name}</div>
        <div className="Directions-container">{statList}</div>
        <div className="Directions-container">
          <div className="Directions-button">
            <Link to="/lobby">Lobby</Link>
          </div>
          <div className="Directions-button">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
