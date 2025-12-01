import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

API.interceptors.request.use(async (config) => {
  try {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) {
      console.log("No access token found");
      return config;
    }

    // Validate token format (JWT has 3 parts separated by dots)
    const tokenParts = accessToken.split(".");
    if (tokenParts.length !== 3) {
      console.error("Invalid token format");
      localStorage.removeItem("accessToken");
      return config;
    }

    // Safely decode token payload
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (!isExpired) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      }
    } catch (decodeError) {
      console.error("Failed to decode token:", decodeError);
      localStorage.removeItem("accessToken");
      return config;
    }

    // Token is expired, try to refresh
    if (!refreshToken) {
      console.log("No refresh token, clearing storage");
      localStorage.clear();
      window.location.href = "/auth/login";
      throw new Error("Missing refresh token");
    }

    if (isRefreshing) {
      const newToken = await new Promise((resolve) => subscribeTokenRefresh(resolve));
      config.headers.Authorization = `Bearer ${newToken}`;
      return config;
    }

    isRefreshing = true;
    try {
      // Send clean refresh token - just the plain JWT string
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const newAccess = data?.accessToken || data?.token || data?.access_token;
      const newRefresh = data?.refreshToken || data?.refresh_token || data?.refresh;

      if (!newAccess) {
        throw new Error("Refresh endpoint did not return access token");
      }

      localStorage.setItem("accessToken", newAccess);
      if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

      onRefreshed(newAccess);
      isRefreshing = false;

      config.headers.Authorization = `Bearer ${newAccess}`;
      return config;
    } catch (err) {
      console.error("Token refresh failed:", err?.response?.data || err.message || err);
      localStorage.clear();
      isRefreshing = false;
      window.location.href = "/auth/login";
      throw err;
    }
  } catch (error) {
    console.error("Request interceptor error:", error);
    throw error;
  }
});

export default API;