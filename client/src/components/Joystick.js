import React, { useEffect, useRef, useState } from "react";

import JoystickController from "../game/joystickController";

const Joystick = (props) => {
  const canvas = useRef();
  const [joystick, setJoystick] = useState();
  useEffect(() => {
    if (canvas) setJoystick(new JoystickController(canvas, props.game));
  }, [canvas, props.game]);
  return (
    <canvas
      ref={canvas}
      onPointerDown={(event) => joystick.onPointerDown(event)}
      onPointerMove={(event) => joystick.onPointerMove(event)}
      onPointerUp={(event) => joystick.onPointerUp(event)}
      onPointerCancel={(event) => joystick.onPointerUp(event)}
    />
  );
};

export default Joystick;
