import { combineReducers, configureStore } from "@reduxjs/toolkit";
import historyReducer from "./slices/history";

export const store = configureStore({
  reducer: combineReducers({
    history: historyReducer,
  }),
  preloadedState: JSON.parse(localStorage.getItem("state") ?? "{}"),
});

store.subscribe(() => {
  localStorage.setItem("state", JSON.stringify(store.getState()));
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
