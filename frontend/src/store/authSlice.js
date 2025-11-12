import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");

const initialState = {
  status: !!storedUser,
  userData: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { userData } = action.payload;

      state.status = true;
      state.userData = userData;

      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData)); 
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
