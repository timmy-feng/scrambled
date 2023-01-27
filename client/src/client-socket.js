import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

// poll socket ping every second so client prediction is smoother
const PING_FREQUENCY = 200;

export let socketPing = 0; // in ms
let pingQueue = [];

setInterval(() => {
  console.log(`Ping: ${socketPing}`);
  socket.emit("pingTest");
  pingQueue.push(Date.now());
}, PING_FREQUENCY);

socket.on("pingResult", () => {
  socketPing = Date.now() - pingQueue.shift();
});

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
