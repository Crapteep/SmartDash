import { useEffect, useRef } from "react";

export const useWebSocket = (handleData, token = "", usedPins) => {
  const ws = useRef(null);
  const URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const connectWebSocket = () => {
      const URLWithoutProtocol = URL.replace(/^https?:\/\//, "");
      const wsProtocol = URL.startsWith("https") ? "wss://" : "ws://";
      ws.current = new WebSocket(
        `${wsProtocol}${URLWithoutProtocol}/api/v1/ws/?token=${token}`
      );

      ws.current.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        handleData(newData);
      };

      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
        // setTimeout(connectWebSocket, 3000);
      };
    };

    if (token) {
      connectWebSocket();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token, usedPins]);

  const sendData = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.log("WebSocket connection is not open.");
    }
  };

  return { sendData };
};
