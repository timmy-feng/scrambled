import { navigate } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

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
      playerList = rooms[roomCode].players.map((player, i) => (
        <p key={i}>
          {player}
          {i == 0 ? " (host)" : ""}
        </p>
      ));

      if (rooms[roomCode].players[0] == props.userId) {
        startGameButtons = (
          <div>
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
      <>
        <h1>Room {roomCode}</h1>
        {playerList}
        {startGameButtons}
        <button onClick={() => socket.emit("leaveroom")}>Leave Room</button>
      </>
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
      <>
        <h1>Join a Room</h1>
        {roomList}
        <button onClick={() => socket.emit("createroom")}>Create Room</button>
      </>
    );
  }
};

export default Lobby;
