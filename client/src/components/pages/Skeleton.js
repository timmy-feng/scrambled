import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";

import GameCanvas from "../GameCanvas";

import "../../utilities.css";
import "./Skeleton.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID =
  "405770742094-nsvn5kjdutoiito75u15c7b78eqmekmf.apps.googleusercontent.com";

const Skeleton = ({ userId, handleLogin, handleLogout }) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {userId ? (
        <button
          onClick={() => {
            googleLogout();
            handleLogout();
          }}
        >
          Logout
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleLogin}
          onError={(err) => console.log(err)}
        />
      )}
      <GameCanvas />
    </GoogleOAuthProvider>
  );
};

export default Skeleton;
