
import { configureStore } from '@reduxjs/toolkit';
import chartReducer from '../redux/reducers/chartReducer'
import buttonReducer from '../redux/reducers/buttonReducer'

const store = configureStore({
  reducer: {
    chart: chartReducer,
    button: buttonReducer
  },
});

export default store;


