import geckos from "@geckos.io/client";
// import socketIOClient from "socket.io-client";
import { post } from "./utilities";
// const endpoint = window.location.hostname + ":" + window.location.port;
// export const socket = socketIOClient(endpoint);
// socket.on("connect", () => {
//   post("/api/initsocket", { socketid: socket.id });
// });
export const socket = geckos();
socket.onConnect((error) => {
  if (error) {
    console.error(error.message);
    return;
  }
  console.log(socket.id);
  post("/api/initsocket", { socketid: socket.id });
});

// poll socket ping so client prediction is smoother
export let socketPing = 0; // in ms
socket.on("pong", (latency) => (socketPing = 0.9 * socketPing + 0.2 * latency));

// socket api below

export const sendArrowDown = (arrowCode) => {
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
