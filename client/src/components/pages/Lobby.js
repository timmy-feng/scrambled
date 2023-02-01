import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import Mascot from "../features/Mascot";

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
      playerList = (
        <div className="Players-container">
          {rooms[roomCode].map((player, i) => (
            <Mascot name={player.name} costume={player.costume} />
          ))}
        </div>
      );

      if (rooms[roomCode][0]._id == props.userId) {
        startGameButtons = (
          <div className="Maps-behind">
            <div className="Maps-container u-flex">
              {MAPS.map((map) => (
                <div className="Map-card">
                  <button
                    className="Map-button"
                    key={map}
                    onClick={() => {
                      console.log("clicked");
                      socket.emit("startgame", map);
                    }}
                  >
                    <div className="img-container">
                      <img className="map-img" src={`${map}.png`} />
                    </div>
                    <div className="Map-title-container">
                      <p className="Map-title u-font">{map}</p>
                    </div>
                  </button>
                </div>
              ))}
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
              <span className=" button-front u-font">Leave</span>
            </div>
            <div className="Split-button button-pushable">
              <span className="button-front u-font">
                <Link to="/">Home</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    const roomList = [];
    /* for (const roomCode in rooms) {
      roomList.push(
        <div key={roomCode}>
          <button onClick={() => socket.emit("joinroom", roomCode)}>
            {roomCode}
          </button>
        </div>
      ); */

    //let roomsTest = ["asdb", "asdjh"];
    for (const roomCode in rooms) {
      roomList.push(
        <div key={roomCode}>
          <li
            className="u-font u-rounded u-brown Room-available"
            onClick={() => socket.emit("joinroom", roomCode)}
          >
            <span className="u-white Room-available-text">{roomCode}</span>
          </li>
        </div>
      );
    }

    //const roomList1 = ["AHJS", "AOQJ"];

    //console.log("roomlist", roomList)
    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Join a Room</h2>
          </div>
          <>
            <div className="Rooms-container">
              <ul className="Rooms-list">{roomList}</ul>
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
