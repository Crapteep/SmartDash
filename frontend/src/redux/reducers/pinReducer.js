const initialUsedPinsState = {
    chart: [],
    label: [],
  };
  
  export const usedPinsReducer = (state = initialUsedPinsState, action) => {
    switch (action.type) {
      case 'ADD_USED_PIN':
        if (!state[action.reducerName].includes(action.pin)) {
          return {
            ...state,
            [action.reducerName]: [...state[action.reducerName], action.pin],
          };
        }
        return state;
        
      case 'REMOVE_USED_PIN':
        return {
          ...state,
          [action.reducerName]: state[action.reducerName].filter((p) => p !== action.pin),
        };
        
      default:
        return state;
    }
  };