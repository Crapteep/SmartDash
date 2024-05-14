// actions.js

export const sendData = (data) => ({
  type: "SEND_DATA",
  payload: data,
});

export const clearSendData = () => ({
  type: "CLEAR_SEND_DATA",
});
