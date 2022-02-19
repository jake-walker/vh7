import { createSlice } from "@reduxjs/toolkit";

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: []
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.items = state.items.slice(-10);
    },
    clear: (state) => {
      state.items = [];
    }
  }
})

export const { addItem, clear } = historySlice.actions;

export default historySlice.reducer;
