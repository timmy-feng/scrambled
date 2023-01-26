import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

// socket api below

export const sendArrowDown = (arrowCode) => {
  console.log(arrowCode);
  socket.emit("arrowDown", arrowCode);
};

export const sendArrowUp = (arrowCode) => {
  socket.emit("arrowUp", arrowCode);
};

export const sendSpacebarDown = () => {
  socket.emit("spacebarDown");
};

export const sendSpacebarUp = () => {
  socket.emit("spacebarUp");
};

export const sendMouseDown = () => {
  socket.emit("mouseDown");
};

export const sendMouseUp = () => {
  socket.emit("mouseUp");
};

export const sendMouseMove = (mousePos) => {
  socket.emit("mouseMove", mousePos);
};
