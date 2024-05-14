// WebSocketContext.jsx
import React, { createContext, useContext } from "react";

const WebSocketContext = createContext();

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children, sendData }) => (
  <WebSocketContext.Provider value={{ sendData }}>
    {children}
  </WebSocketContext.Provider>
);
