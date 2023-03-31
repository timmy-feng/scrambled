import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";
import DressedEgg from "../../components/features/DressedEgg"

import "./Costumes.css";

const description = [
  "Plain and Simple",
  "Play Your First Game",
  "Play 20 Games",
  "Get 5 Kills",
  "Get 50 Kills",
  "Eat 5 Seaweed",
  "Eat 100 Scallion",
  "Eat 200 Garlic or Fish Cake",
];

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

  useEffect(() => {
    if (selected != undefined) {
      socket.emit("setcostume", selected);
      setDetails(selected)
    }
  }, [selected]);

  const costumeList = [];
  for (let i = 0; i < 8; i++) {
    costumeList.push(
      <DressedEgg 
        isEnabled = {enabled[i]}
        costume = {costumes[i]}
        details = {details} // need the brackets???
        selected = {selected}
        i = {i}
        setDetails = {setDetails}
        setSelected = {setSelected}
      />
    );
  }

  return (
    <div className="Costumes-mainContainer u-flex">
      <div className="Costumes-secondaryContainer u-flex">
        <div className="Title-container u-flex">
          <h2 className="Costumes-titleText">Eggcessories</h2>
        </div>
        <div className="Costumes-costumeContainer">{costumeList}</div>
        <div className="Costumes-descriptionContainer">
          {details == undefined ? null : (
            <>
              {enabled[details] ? (
                <span>Unlocked: </span>
              ) : (
                <span className="Costumes-lockedText">LOCKED: </span>
              )}
              <span>{description[details]}</span>
            </>
          )}
        </div>
        <button className="Directions-button button-pushable">
          <span className="button-front">
            <Link to="/">Home</Link>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Costumes;
