
import { configureStore } from '@reduxjs/toolkit';
import chartReducer from '../redux/reducers/chartReducer'
import buttonReducer from '../redux/reducers/buttonReducer'
import labelReducer from './reducers/labelReducer';
import { usedPinsReducer } from './reducers/pinReducer';

const store = configureStore({
  reducer: {
    chart: chartReducer,
    button: buttonReducer,
    label: labelReducer,
    usedPins: usedPinsReducer
  },
});

export default store;


