import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './slices/history';

const store = configureStore({
  reducer: {
    history: historyReducer
  },
  preloadedState: JSON.parse(localStorage.getItem('state')) || {}
});

store.subscribe(() => {
  localStorage.setItem('state', JSON.stringify(store.getState()));
});

export default store;
