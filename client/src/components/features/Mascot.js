import React from "react";

const egg = "/yolk-head.png";
const costumes = [];
for (let i = 0; i < 8; ++i) {
  costumes.push(`/costumes/cos${i}.png`);
}

import "./Mascot.css";

const Mascot = (props) => {
  return (
    <div className="Mascot-container">
      <div className="Mascot-subcontainer">
        <div className="Mascot-mascot">
          <img className="Mascot-egg" src={egg} />
          {props.costume ? (
            <img className="Mascot-costume" src={costumes[props.costume]} />
          ) : null}
        </div>
      </div>
      <div className="Mascot-subcontainer">
        <div className="Mascot-text">{props.name}</div>
      </div>
    </div>
  );
};

export default Mascot;
