import { navigate } from "@reach/router";
import React, { useEffect, useState } from "react";
import { removeSocketListener, socket } from "../../client-socket";

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
    let startGameButton = null;

    if (roomCode in rooms) {
      playerList = rooms[roomCode].players.map((player, i) => (
        <p key={i}>
          {player}
          {i == 0 ? " (host)" : ""}
        </p>
      ));

      if (rooms[roomCode].players[0] == props.userId) {
        startGameButton = (
          <button onClick={() => socket.emit("startgame")}>Start Game</button>
        );
      }
    }

    return (
      <>
        <h1>Room {roomCode}</h1>
        {playerList}
        {startGameButton}
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