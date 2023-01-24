import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

export const moveWhite = (dir) => {
  socket.emit("move", dir);
};

export const movePtr = (pos) => {
  socket.emit("ptr", pos);
};

export const setClick = (clicked) => {
  socket.emit("click", clicked);
};
