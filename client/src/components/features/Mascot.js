import React, { useState } from "react";

const idleEgg = "/yolk-head.png";
const clickEgg = "/stun-1.png";

const costumes = [];
for (let i = 0; i < 8; ++i) {
  costumes.push(`/costumes/cos${i}.png`);
}

import "./Mascot.css";

const Mascot = (props) => {
  const [egg, setEgg] = useState(idleEgg);

  return (
    <div className="Mascot-container">
      <div
        className="Mascot-subcontainer"
        onMouseDown={() => setEgg(clickEgg)}
        onMouseUp={() => setEgg(idleEgg)}
      >
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
