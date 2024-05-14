// actions.js

export const updatePinData = (pinNumber, newData, timestamp) => ({
  type: 'UPDATE_PIN_DATA',
  payload: { pinNumber, newData, timestamp },
});


export const resetNewDataFlag = (pinNumber) => ({
  type: 'RESET_NEW_DATA_FLAG',
  payload: pinNumber,
});