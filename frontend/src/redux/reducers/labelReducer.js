const initialState = {
    value: 0,
  };
  
  const labelReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'UPDATE_LABEL_VALUE':
        return {
          ...state,
          pinData: action.payload,
        };
      case 'RESET_LABEL_VALUE':
        return {
          ...state,
          value: 0,
        };
      case 'RESET_LABEL_STATE':
        return initialState;
      default:
        return state;
    }
  };
  
  export default labelReducer;