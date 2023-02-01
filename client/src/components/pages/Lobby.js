import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import "./Skeleton.css";

const MAPS = ["rice", "ramen", "shakshuka"];

const Lobby = (props) => {
  if (!props.userId) navigate("/");

  const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState();

  useEffect(() => {
    socket.on("updaterooms", (rooms) => {
      setRooms(rooms);
    });

    socket.on("updateroom", (room) => {
      setRoomCode(room);
    });

    socket.on("startgame", () => {
      navigate("/game");
    });

    return () => {
      removeSocketListener("updaterooms");
      removeSocketListener("updateroom");
      removeSocketListener("startgame");
    };
  }, []);

  useEffect(() => {
    const requestLoop = setInterval(() => {
      socket.emit("requestrooms");
    }, 200);
    return () => {
      clearInterval(requestLoop);
    };
  }, []);

  if (roomCode) {
    let playerList = null;
    let startGameButtons = null;

    if (roomCode in rooms) {
      playerList = rooms[roomCode].map((player, i) => (
        <div className="Directions-button" key={i}>
          {player.name + (i == 0 ? " (host)" : "")}
        </div>
      ));

      if (rooms[roomCode][0]._id == props.userId) {
        startGameButtons = (
          <div className="Directions-button">
            <span>Start Game: </span>
            {MAPS.map((map) => (
              <button key={map} onClick={() => socket.emit("startgame", map)}>
                {map}
              </button>
            ))}
          </div>
        );
      }
    }

    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Room {roomCode}</h2>
          </div>
          {playerList}
          {startGameButtons}
          <div
            className="Directions-button"
            onClick={() => socket.emit("leaveroom")}
          >
            Leave Room
          </div>
          <div className="Directions-button">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    );
  } else {
    const roomList = [];
    for (const roomCode in rooms) {
      roomList.push(
        <div key={roomCode}>
          <button onClick={() => socket.emit("joinroom", roomCode)}>
            {roomCode}
          </button>
        </div>
      );
    }

    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Join A Room</h2>
          </div>
          {roomList}
          <div
            className="Directions-button"
            onClick={() => socket.emit("createroom")}
          >
            Create Room
          </div>
          <div
            className="Directions-button"
            onClick={() => socket.emit("requestrooms")}
          >
            Refresh
          </div>
          <div className="Directions-button">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    );
  }
};

export default Lobby;
