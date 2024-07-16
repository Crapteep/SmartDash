import React, { useRef, useState, useEffect, useMemo } from "react";
import Nipple from "react-nipple";
import "react-nipple/lib/styles.css";
import { useWebSocketContext } from "../../../providers/WebSocketProvider";

const MyJoystick = ({
  virtual_pins,
  isEditMode,
  size,
  background_color,
  mode,
  color,
  lock_x,
  lock_y,
  rest_joystick,
}) => {
  const { sendData } = useWebSocketContext();
  const bufferRef = useRef([]);
  const [intervalId, setIntervalId] = useState(null);
  const delayMilliseconds = 50;
  const containerRef = useRef(null);
  const nippleRef = useRef(null);
  const [joystickKey, setJoystickKey] = useState(0);

  const initialOptions = useMemo(() => ({
    position: { top: "50%", left: "50%" },
    size: size,
    restOpacity: 0.8,
    color: color || '#808589',
    mode: mode,
    restJoystick: rest_joystick,
    lockX: lock_x,
    lockY: lock_y,
    dynamicPage: true,
  }), [size, color, mode, rest_joystick, lock_x, lock_y]);


  const [currentOptions, setCurrentOptions] = useState(initialOptions);

  useEffect(() => {
    if (!isEditMode) {
      setCurrentOptions(initialOptions);
      setJoystickKey(prev => prev + 1);
    }
  }, [isEditMode, initialOptions]);

  const updateJoystickPosition = () => {
    if (containerRef.current && nippleRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      setCurrentOptions(prev => ({
        ...prev,
        position: {
          left: `${centerX}px`,
          top: `${centerY}px`,
        },
      }));
      setJoystickKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      updateJoystickPosition();
    }
  }, [isEditMode]);

  useEffect(() => {
    window.addEventListener("resize", updateJoystickPosition);
    return () => {
      window.removeEventListener("resize", updateJoystickPosition);
    };
  }, []);

  const handleJoystickMove = (evt, data) => {
    console.log(data);
    bufferRef.current.push(data);

    if (!intervalId) {
      const id = setInterval(sendBufferedData, delayMilliseconds);
      setIntervalId(id);
    }
  };

  const handleJoystickEnd = (evt, data) => {
    bufferRef.current.push(data);

    if (!intervalId) {
      const id = setInterval(sendBufferedData, delayMilliseconds);
      setIntervalId(id);
    }
  };

  const sendBufferedData = () => {
    if (bufferRef.current.length > 0) {
      const dataToSend = {
        code: 9,
        pin: virtual_pins && virtual_pins[0] ? virtual_pins[0].pin : null,
        value: {
          position: bufferRef.current[bufferRef.current.length - 1].position,
          force: bufferRef.current[bufferRef.current.length - 1].force,
          pressure: bufferRef.current[bufferRef.current.length - 1].pressure,
          distance: bufferRef.current[bufferRef.current.length - 1].distance,
          angle: bufferRef.current[bufferRef.current.length - 1].angle,
          direction: bufferRef.current[bufferRef.current.length - 1].direction,
        },
      };

      sendData(dataToSend);
      bufferRef.current = [];
    }
  };


  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        margin: "auto",
        position: "relative",
        background: background_color,
      }}
    >
      <Nipple
        key={joystickKey}
        ref={nippleRef}
        options={currentOptions}
        style={{ width: "100%", height: "100%", pointerEvents: isEditMode ? "none" : "auto", opacity: isEditMode ? 0.5 : 1 }}
        onMove={handleJoystickMove}
        onEnd={handleJoystickEnd}
        disabled={isEditMode}
      />
    </div>
  );
};

export default MyJoystick;
