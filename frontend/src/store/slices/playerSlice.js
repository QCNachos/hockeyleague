import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [],
  loading: false,
  error: null
};

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    // Add player reducers here
  }
});

export default playerSlice.reducer; 