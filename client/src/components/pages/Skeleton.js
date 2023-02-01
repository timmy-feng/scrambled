import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./Skeleton.css";

const GOOGLE_CLIENT_ID =
  "405770742094-nsvn5kjdutoiito75u15c7b78eqmekmf.apps.googleusercontent.com";

let test = "scrambled   text";
test = test.split("");

const Skeleton = ({ userId, handleLogin, handleLogout }) => {
  return (
    <div className="Start-container u-flex">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">scrambled</h2>
          </div>
          {userId ? (
            <>
              <div className="Directions-button">
                <Link to="/lobby">Play</Link>
              </div>

              <div className="Directions-button">
                <Link to="/costumes">Costumes</Link>
              </div>

              <div
                className="Directions-button"
                onClick={() => {
                  googleLogout();
                  handleLogout();
                }}
              >
                Logout
              </div>
            </>
          ) : (
            <GoogleLogin
              onSuccess={handleLogin}
              onError={(err) => console.log(err)}
            />
          )}
          <div className="Directions-button">How to Play</div>
          <div className="Scrambled-text-container u-flex">
            {test.map((letter) => (
              <div
                className="Scrambled-text-letter"
                style={{ rotate: `${20 - 40 * Math.random()}deg` }}
              >
                {letter}
              </div>
            ))}
          </div>
          <div>{}</div>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Skeleton;
