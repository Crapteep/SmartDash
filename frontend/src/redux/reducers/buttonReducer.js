// reducers/chartReducer.js

const initialState = {
    sendData: null, // Inicjalizuj sendData
  };
  
  const buttonReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SEND_DATA':
        return {
          ...state,
          sendData: action.payload,
        };
      case 'CLEAR_SEND_DATA':
        return {
          ...state,
          sendData: null,
        };
      default:
        return state;
    }
  };
  
  export default buttonReducer;
  