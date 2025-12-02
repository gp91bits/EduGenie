import { createSlice } from "@reduxjs/toolkit";

// Load stored values
const storedUser = localStorage.getItem("user");
const storedAccess = localStorage.getItem("accessToken");
const storedRefresh = localStorage.getItem("refreshToken");
const storedUserId = localStorage.getItem("userId");

// Initial state: user is authenticated ONLY if all needed data exists
const initialState = {
  status: Boolean(storedUser && storedAccess && storedRefresh),
  userData: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGIN
    login: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;

      state.status = true;
      state.userData = user;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id);
    },

    // LOGOUT
    logout: (state) => {
      state.status = false;
      state.userData = null;

      localStorage.removeItem("accessToken");
  
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    },

    // UPDATE STREAK
    updateStreak: (state, action) => {
      if (state.userData) {
        state.userData.streak = action.payload;
        localStorage.setItem("user", JSON.stringify(state.userData));
      }
    },
  },
});

export const { login, logout, updateStreak } = authSlice.actions;
export default authSlice.reducer;
