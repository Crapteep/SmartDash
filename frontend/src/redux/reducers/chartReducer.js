// reducers.js

const initialState = {
  pinsData: {},
  hasNewData: {},
};

const chartReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_PIN_DATA':
      const { pinNumber, newData, timestamp } = action.payload;
      const updatedPinData = {
        value: newData,
        timestamp: timestamp,
      };
      const updatedPinsData = {
        ...state.pinsData,
        [pinNumber]: updatedPinData,
      };
      const updatedHasNewData = {
        ...state.hasNewData,
        [pinNumber]: true,
      };
      return {
        ...state,
        pinsData: updatedPinsData,
        hasNewData: updatedHasNewData,
      };
    case 'RESET_NEW_DATA_FLAG':
      const resetPinNumber = action.payload;
      const updatedHasNewDataReset = {
        ...state.hasNewData,
        [resetPinNumber]: false,
      };
      return {
        ...state,
        hasNewData: updatedHasNewDataReset,
      };
    default:
      return state;
  }
};

export default chartReducer;
