import React, { useState, useEffect } from "react";
import { Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import Lobby from "./pages/Lobby.js";
import Game from "./pages/Game.js";
import NotFound from "./pages/NotFound.js";
import Skeleton from "./pages/Skeleton.js";
import HowToPlay from "./pages/HowToPlay.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import Results from "./pages/Results.js";
import Costumes from "./pages/Costumes.js";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  return (
    <>
      <Router>
        <Lobby path="/lobby" userId={userId} />
        <Game path="/game" userId={userId} />
        <Results path="/results" userId={userId} />
        <Costumes path="/costumes" userId={userId} />
        <HowToPlay path="/howtoplay" userId={userId} />
        <Skeleton
          path="/"
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          userId={userId}
        />
        <NotFound default />
      </Router>
    </>
  );
};

export default App;
