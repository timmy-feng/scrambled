import geckos from "@geckos.io/client";
import { post } from "./utilities";

export const socket = geckos();

// poll socket ping so client prediction is smoother
export let socketPing = 0; // in ms
let pingTime;

socket.onConnect((error) => {
  if (error) {
    console.error(error.message);
    return;
  }
  console.log(`socketid: ${socket.id}`);

  post("/api/initsocket", { socketid: socket.id });

  setInterval(() => {
    socket.emit("ping");
    pingTime = Date.now();
  }, 1000);

  socket.on("pong", () => {
    const latency = Date.now() - pingTime;
    socketPing = 0.9 * socketPing + 0.1 * latency;
  });
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
