import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";

import "./HowToPlay.css";

const instructions = [
  [
    {
      image: "bg.png",
      text: "",
    },
  ],
];

const HowToPlay = (props) => {
  if (!props.userId) navigate("/");

  const [page, setPage] = useState(0);

  const cardList = instructions[page].map((card) => (
    <div className="HowToPlay-card">
      <img className="HowToPlay-image" src={card.image} />
      <div className="HowToPlay-text">{card.text}</div>
    </div>
  ));

  return (
    <div className="HowToPlay-startContainer">
      <div className="HowToPlay-directionsContainer">
        <div className="HowToPlay-cardContainer">{cardList}</div>

        {page == 0 ? null : (
          <div>
            <button
              className=" Directions-button button-pushable"
              onClick={() => setPage(page - 1)}
            >
              <span className="button-front">Back</span>
            </button>
          </div>
        )}

        {page == instructions.length - 1 ? null : (
          <div>
            <button
              className=" Directions-button button-pushable"
              onClick={() => setPage(page + 1)}
            >
              <span className="button-front">Next</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HowToPlay;
