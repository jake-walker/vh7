import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { HistoryItemType } from "../types";

interface HistoryState {
  items: HistoryItemType[]
}

const initialState: HistoryState = {
  items: []
}

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<HistoryItemType>) => {
      state.items.push(action.payload);
      state.items = state.items.slice(-7);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clear: (state) => {
      state.items = [];
    }
  }
})

export const { addItem, clear, removeItem } = historySlice.actions;

export default historySlice.reducer;
