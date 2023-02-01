import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import "./Skeleton.css";
import "./Lobby.css";

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

    socket.emit("requestrooms");

    return () => {
      removeSocketListener("updaterooms");
      removeSocketListener("updateroom");
      removeSocketListener("startgame");
    };
  }, []);

  if (roomCode) {
    let playerList = null;
    let startGameButtons = null;

    if (roomCode in rooms) {
      if (rooms[roomCode].inGame) navigate("/game");
      playerList = rooms[roomCode].players.map((player, i) => (
        <div className="Directions-button" key={i}>
          {player.name + (i == 0 ? " (host)" : "")}
        </div>
      ));

      if (rooms[roomCode].players[0]._id == props.userId) {
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
    for (const room in rooms) {
      if (!rooms[room].inGame)
        roomList.push(
          <div key={room}>
            <button onClick={() => socket.emit("joinroom", room)}>
              {room}
            </button>
          </div>
        );
    }

    

    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Join a Room</h2>
          </div>
          {roomList.length === 0 ? roomList: <div>no rooms!</div>}
          {roomList}
          <div className="Rooms-container">
          <ul className="Rooms-list">
            <li><button className="Room-button">ASHJ</button></li>
            <li><button className="Room-button">ADPO</button></li>
          </ul>
          </div>

          

          <button
            className="Directions-button button-pushable"
            onClick={() => socket.emit("createroom")}
          >
            <span className="button-front">Create Room</span>
            
          </button>
          <button
            className="Directions-button button-pushable"
            onClick={() => socket.emit("requestrooms")}
          >
            <span className="button-front">
            Refresh
            </span>
            
          </button>
          <button className="Directions-button button-pushable">
            <span className="button-front">
            <Link to="/">Home</Link>
            </span>
            
          </button>
        </div>
      </div>
    );
  }
};

export default Lobby;
