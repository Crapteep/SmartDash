// actions.js

export const updatePinData = (pinNumber, newData, interval) => ({
  type: 'UPDATE_PIN_DATA',
  payload: { pinNumber, newData, interval },
});


export const resetNewDataFlag = (pinNumber) => ({
  type: 'RESET_NEW_DATA_FLAG',
  payload: pinNumber,
});