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
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) return config;

  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  const isExpired = payload.exp * 1000 < Date.now();

  if (!isExpired) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  if (!refreshToken) {
    localStorage.clear();
    window.location.href = "/auth/login";
    throw new Error("Missing refresh token");
  }

  if (isRefreshing) {
    const newToken = await new Promise((resolve) =>
      subscribeTokenRefresh(resolve)
    );
    config.headers.Authorization = `Bearer ${newToken}`;
    return config;
  }

  isRefreshing = true;
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/refresh`,
      { token: refreshToken },
      { withCredentials: true }
    );

    const { accessToken: newAccess, refreshToken: newRefresh } = data;

    localStorage.setItem("accessToken", newAccess);
    if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

    onRefreshed(newAccess);
    isRefreshing = false;

    config.headers.Authorization = `Bearer ${newAccess}`;
    return config;
  } catch (err) {
    console.error("Token refresh failed:", err);
    const refreshToken = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem("userId");

    if (refreshToken && userId) {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        id: userId,
        token: refreshToken,
      });
    }
    localStorage.clear();
    isRefreshing = false;
    window.location.href = "/auth/login";
    throw err;
  }
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403 || err.response?.status === 401) {
      console.warn("Unauthorized — forcing logout");
      localStorage.clear();
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default API;
