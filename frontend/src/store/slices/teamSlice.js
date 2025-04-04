import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teams: [],
  loading: false,
  error: null
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    // Add team reducers here
  }
});

export default teamSlice.reducer; 