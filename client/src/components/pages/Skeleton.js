import React, { useEffect, useRef, useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./Skeleton.css";
import { GAME } from "../../../../shared/constants";

const GOOGLE_CLIENT_ID =
  "375196652001-nhj4snbmqe02g5oi5gkhl0mcjghn8ctb.apps.googleusercontent.com";

let test = "2023";
test = test.split("");

let test2 = "weblab";
test2 = test2.split("");

let rotateBy = [10, -30, 20, 0, 10, -10, 5, -10, 5];

const randomRotate = (str) => {};

const imageFrom = (src) => {
  const image = new Image();
  image.src = src;
  return image;
};

const blink1 = imageFrom("blink-1.png");

//blink 5 and blink 1 alternate
const BLINK = [
  "blink-1.png",
  "blink-2.png",
  "blink-3.png",
  "blink-4.png",
  "blink-5.png",
  "blink-6.png",
];
const blinkImgs = BLINK.map((img) => imageFrom(img));
const showImg = [
  0, 1, 2, 3, 4, 5, 0, 4, 0, 4, 0, 4, 4, 4, 0, 0, 0, 4, 0, 4, 0, 0, 0,
]; // indicies of blinkImgs -> morse code

const animFPS = 6;

//let img = blink1;
let frame = 0;

const Skeleton = ({ userId, handleLogin, handleLogout }) => {
  const canvas = useRef();
  //const [frame, setFrame] = useState(0);
  //const [animIndex, setAnimIndex] = useState(0);

  useEffect(() => {
    // animate

    const context = canvas.current.getContext("2d");
    //console.log(blink1)
    const img = blinkImgs[0]; // Set source path

    var hRatio = canvas.current.width / img.width;
    var vRatio = canvas.current.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width * ratio,
      img.height * ratio
    );

    const animate = setInterval(() => {
      updateAnim();
    }, 1000 / animFPS);

    return () => {
      clearInterval(animate);
    };
  }, []);

  const updateAnim = () => {
    const context = canvas.current.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.current.width, canvas.current.height);
      let newFrame = frame % showImg.length;

      const img1 = blinkImgs[showImg[newFrame]];

      const width = img1.width;
      const height = img1.height;

      // console.log("w", canvas.current.width);

      var hRatio = canvas.current.width / width;
      var vRatio = canvas.current.height / height;

      var ratio = Math.min(hRatio, vRatio);

      // console.log(ratio);

      context.drawImage(
        img1,
        0,
        0,
        width,
        height,
        0,
        0,
        width * ratio,
        height * ratio
      );

      // console.log("inside");

      frame = frame + 1;
      // console.log(frame, "frame");
    }

    /* if (context) {
      context.clearRect(0, 0, canvas.current.width, canvas.current.height)
      i = i % showImg.length;

      const img1 = new Image(); // Create new img element
      img1.src = BLINK[showImg[i]];
      console.log("img", img1);

      var hRatio = canvas.current.width / img1.width;
      var vRatio = canvas.current.height / img1.height;

      var ratio = Math.min(hRatio, vRatio);

      console.log("img", ratio);

      context.drawImage(
        img1,
        0,
        0,
        img1.width,
        img1.height,
        0,
        0,
        img1.width * ratio,
        img1.height * ratio
      );

      i = i + 1;
    } */
  };

  return (
    <>
      <div className="Start-container u-flex">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <div className="Directions-container u-flex">
            <div>
              <canvas id="start-anim" ref={canvas} />
            </div>
            <div className="Title-container u-flex">
              <h2 className="Title-text">scrambled</h2>
            </div>
            {userId ? (
              <>
                <button className="Directions-button button-pushable">
                  <span className="button-front">
                    <Link to="/lobby">Play</Link>
                  </span>
                </button>

                <button className="Directions-button button-pushable">
                  <span className="button-front">
                    <Link to="/costumes">Costumes</Link>
                  </span>
                </button>

                <button className="Directions-button button-pushable">
                  <span className="button-front">
                    <Link to="/howtoplay">How To Play</Link>
                  </span>
                </button>
                <button
                  className="Directions-button button-pushable"
                  onClick={() => {
                    googleLogout();
                    handleLogout();
                  }}
                >
                  <span className="button-front">Logout</span>
                </button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleLogin}
                onError={(err) => console.log(err)}
              />
            )}
            <div className="Scrambled-text-container u-flex">
              {test2.map((letter) => (
                <div
                  className="Scrambled-text-letter"
                  style={{ rotate: `${20 - 40 * Math.random()}deg` }}
                >
                  {letter}
                </div>
              ))}{" "}
              {test.map((letter) => (
                <div
                  className="Scrambled-text-letter"
                  style={{ rotate: `${20 - 40 * Math.random()}deg` }}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/*  <div className="u-flex">
              {test.map((letter, i) => (
                <div
                  className="Scrambled-text-letter"
                  style={{ rotate: `${rotateBy[i]}deg`, margin: "0 1px" }}
                >
                  {letter}
                </div>
              ))}
            </div> */}
            <div>{}</div>
          </div>
        </GoogleOAuthProvider>
      </div>
    </>
  );
};

export default Skeleton;
