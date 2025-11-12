// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

// Helper — queue pending requests while refresh in progress
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ---------------------
// REQUEST INTERCEPTOR
// ---------------------
API.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) return config;

  // Decode JWT payload to check expiry
  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  const isExpired = payload.exp * 1000 < Date.now();

  // If access token still valid → attach and go
  if (!isExpired) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  // If expired but no refresh token → logout
  if (!refreshToken) {
    localStorage.clear();
    window.location.href = "/login";
    return Promise.reject(new Error("No refresh token found"));
  }

  // If refresh already happening → queue request
  if (isRefreshing) {
    const newToken = await new Promise((resolve) => subscribeTokenRefresh(resolve));
    config.headers.Authorization = `Bearer ${newToken}`;
    return config;
  }

  // Start refresh process
  isRefreshing = true;
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/refresh`,
      { token: refreshToken },
      { withCredentials: true }
    );

    // Store new tokens
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

    accessToken = data.accessToken;
    onRefreshed(accessToken);
    isRefreshing = false;

    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  } catch (err) {
    console.error("Token refresh failed:", err);
    localStorage.clear();
    isRefreshing = false;
    window.location.href = "/login";
    return Promise.reject(err);
  }
});

// ---------------------
// RESPONSE INTERCEPTOR
// ---------------------
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized (access token invalid/expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/refresh`,
          { token: refreshToken },
          { withCredentials: true }
        );

        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (err) {
        console.error("401 → Refresh failed:", err);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
