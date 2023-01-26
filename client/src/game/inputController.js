import {
  sendSpacebarDown,
  sendSpacebarUp,
  sendArrowDown,
  sendArrowUp,
  sendMouseDown,
  sendMouseUp,
  sendMouseMove,
} from "../client-socket.js";
import Vector from "../../../shared/vector.js";

const arrowCode = {
  ArrowUp: 0,
  w: 0,
  W: 0,
  ArrowDown: 1,
  s: 1,
  S: 1,
  ArrowRight: 2,
  d: 2,
  D: 2,
  ArrowLeft: 3,
  a: 3,
  A: 3,
};

export const onKeyDown = (event) => {
  if (event.repeat) return;
  if (event.key == " ") sendSpacebarDown();
  else if (event.key in arrowCode) sendArrowDown(arrowCode[event.key]);
};

export const onKeyUp = (event) => {
  if (event.key == " ") sendSpacebarUp();
  else if (event.key in arrowCode) sendArrowUp(arrowCode[event.key]);
};

export const onMouseDown = (event) => {
  sendMouseDown();
};

export const onMouseUp = (event) => {
  sendMouseUp();
};

export const onMouseMove = (event, canvas) => {
  const rect = canvas.current.getBoundingClientRect();
  sendMouseMove(
    new Vector(event.clientX - rect.left, -(event.clientY - rect.top))
  );
};
