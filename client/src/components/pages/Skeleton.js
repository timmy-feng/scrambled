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

              <div className="Directions-button">Achievements</div>
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
          <div>{}</div>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Skeleton;
