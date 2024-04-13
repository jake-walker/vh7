import { createSlice } from "@reduxjs/toolkit";

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: []
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.items = state.items.slice(-7);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clear: (state) => {
      state.items = [];
    }
  }
})

export const { addItem, clear, removeItem } = historySlice.actions;

export default historySlice.reducer;
