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
          <div className="u-rounded">
            <div className="Map-container u-flex u-rounded">
              {MAPS.map((map) => (
                <button
                  className="Map-button Directions-button"
                  key={map}
                  onClick={() => socket.emit("startgame", map)}
                >
                  <div className="img-Container">
                    <img className="map-img" src={`${map}.png`} />
                  </div>
                  <p className="map-title">{map}</p>
                </button>
              ))}
            </div>

            <div>
              <button className=" Directions-button button-pushable">
                <span className="button-front">Start Game: </span>
              </button>
            </div>
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
          <div className="Escape-container u-split buttons u-flex u-space-between ">
            <div
              className="Split-button button-pushable"
              onClick={() => socket.emit("leaveroom")}
            >
              <span className=" button-front">Leave Room</span>
            </div>
            <div className="Split-button button-pushable">
              <span className="button-front">
                <Link to="/">Home</Link>
              </span>
            </div>
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

    //const roomList1 = ["AHJS", "AOQJ"];
    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Join a Room</h2>
          </div>
          <>
            <div className="Rooms-container">
              <ul className="Rooms-list">
                {roomList.map((room) => (
                  <li className="u-font u-rounded u-brown Room-available">
                    <span className="u-white Room-available-text">{room}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>

          <div className="space"></div>

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
            <span className="button-front">Refresh</span>
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
