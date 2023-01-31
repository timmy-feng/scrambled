import geckos from "@geckos.io/client";
import { post } from "./utilities";

export const socket = geckos();

// poll socket ping so client prediction is smoother
export let socketPing = 0; // in ms
let pingTime;

socket.onConnect((error) => {
  console.log("socket connected");
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

export const removeSocketListener = (eventName) => {
  socket.bridge.eventEmitter.off(eventName);
};
