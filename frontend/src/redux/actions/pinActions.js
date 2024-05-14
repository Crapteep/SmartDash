export const addUsedPin = (reducerName, pin) => ({
    type: 'ADD_USED_PIN',
    reducerName,
    pin,
  });
  
  export const removeUsedPin = (reducerName, pin) => ({
    type: 'REMOVE_USED_PIN',
    reducerName,
    pin,
  });