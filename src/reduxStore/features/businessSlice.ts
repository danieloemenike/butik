// userSlice.js

import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Business {
    userId ?: string
    email: string
    name: string,
    phoneNumber?: string,
    address: string,
    city: string,
    country: string,
    slug: string
}

type businessState = Business | {};

const initialState: businessState = {}

const businessSlice = createSlice({
  name: "businessSlice",
  initialState,
  reducers: {
    setUserBusiness: (state, action: PayloadAction<Business>) => {
      return state = action.payload; // Set the user data
    },
    clearUserBusiness: (state) => {
      return {}; // Clear the user data
    },
  },
});

export const { setUserBusiness, clearUserBusiness } = businessSlice.actions;

export default businessSlice.reducer;
