import { navigate, Link } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

import Mascot from "../features/Mascot";

import "./Skeleton.css";
import "./Lobby.css";

const INTERNAL_MAPS = ["rice", "ramen", "shakshuka"];
const MAPS = ["Fried Rice", "Ramen", "Shakshuka"];

const Lobby = (props) => {
  if (!props.userId) navigate("/");

  const [map, setMap] = useState(0);

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

  if (!roomCode) return null;

  if (roomCode == "none") {
    const roomList = [];

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

    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <h2 className="Title-text">Join a Room</h2>
          </div>
          <div className="Lobby-columns u-margin-top">
            <div className="Rooms-container">
              <ul className="Rooms-list">{roomList}</ul>
            </div>
            <div className="Lobby-buttonsContainer">
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
        </div>
      </div>
    );
  } else {
    let playerList = null;
    let mapSelectionButtons = null;
    let startGameButton = null;

    if (roomCode in rooms) {
      playerList = (
        <div className="Players-container">
          {rooms[roomCode].map((player, i) => (
            <Mascot name={player.name} costume={player.costume} />
          ))}
        </div>
      );

      if (rooms[roomCode][0]._id == props.userId) {
        mapSelectionButtons = (
          <div>
            <div className="Lobby-columns">
              <div>
                <button
                  className="Directions-button button-pushable"
                  onClick={() => setMap(map ? map - 1 : 0)}
                >
                  <span className="button-front">{"<"}</span>
                </button>
              </div>
              <div className="Maps-text">{MAPS[map]}</div>
              <div>
                <button
                  className="Directions-button button-pushable"
                  onClick={() => setMap(map + 1 < MAPS.length ? map + 1 : map)}
                >
                  <span className="button-front">{">"}</span>
                </button>
              </div>
            </div>
            <div className="Lobby-columns">
              <div className="Maps-textSmall">Map </div>
            </div>
          </div>
        );

        startGameButton = (
          <button
            className="Directions-button button-pushable"
            onClick={() => socket.emit("startgame", INTERNAL_MAPS[map])}
          >
            <span className="button-front">Start Game</span>
          </button>
        );
        // startGameButtons = (
        //   <div className="Maps-behind">
        //     <div className="Maps-container u-flex">
        //       {MAPS.map((map) => (
        //         <div className="Map-card">
        //           <button
        //             className="Map-button"
        //             key={map}
        //             onClick={() => {
        //               socket.emit("startgame", map);
        //             }}
        //           >
        //             <div className="img-container">
        //               <img className="map-img" src={`${map}.png`} />
        //             </div>
        //             <div className="Map-title-container">
        //               <p className="Map-title u-font">{map}</p>
        //             </div>
        //           </button>
        //         </div>
        //       ))}
        //     </div>
        //   </div>
        // );
      }
    }

    return (
      <div className="Start-container u-flex">
        <div className="Directions-container u-flex">
          <div className="Title-container u-flex">
            <div>
              <h2 className="Title-text">Room {roomCode}</h2>
              <div className="u-brown Title-subtext">
                eat other eggs to win!
              </div>
            </div>
          </div>
          <div className="Lobby-columns">
            <div className="Lobby-view">
              {playerList}
              {mapSelectionButtons}
            </div>
            <div className="Lobby-buttonsContainer">
              {startGameButton}
              <button
                className="Directions-button button-pushable"
                onClick={() => socket.emit("leaveroom")}
              >
                <span className="button-front">Leave Room</span>
              </button>
              <button className="Directions-button button-pushable">
                <span className="button-front">
                  <Link to="/">Home</Link>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Lobby;
