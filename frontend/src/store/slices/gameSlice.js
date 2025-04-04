import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  games: [],
  loading: false,
  error: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Add game reducers here
  }
});

export default gameSlice.reducer; 