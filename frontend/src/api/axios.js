
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// refresh queue helpers
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getStoredRefresh = () => {
  try {
    const r = localStorage.getItem("refreshToken");
    if (!r || typeof r !== "string") return null;
    const t = r.trim();
    if (!t) return null;
    return t;
  } catch (e) {
    return null;
  }
};

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (accessToken) API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

const refreshRequest = async () => {
  const refreshToken = getStoredRefresh();
  if (!refreshToken) throw new Error("No refresh token available");

  // call backend refresh endpoint
  const url = `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")}/auth/refresh`;
  const { data } = await axios.post(url, { refreshToken }, { withCredentials: true });
  // backend should return { accessToken, refreshToken }
  const newAccess = data?.accessToken || data?.token || data?.access_token;
  const newRefresh = data?.refreshToken || data?.refresh_token || data?.refresh;
  if (!newAccess) {
    throw new Error("Refresh endpoint did not return access token");
  }
  // persist tokens
  setTokens({ accessToken: newAccess, refreshToken: newRefresh });
  return newAccess;
};

const decodeJWT = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

// Helper: check if token is expired
const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
};

// Request interceptor — attaches access token or triggers refresh if expired
API.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      // If we have a valid access token, use it
      if (accessToken && !isTokenExpired(accessToken)) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      }

      // No valid access token or expired -> attempt refresh
      const refreshToken = getStoredRefresh();
      if (!refreshToken) {
        // no refresh token: let request proceed without auth
        return config;
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            resolve(config);
          });
        });
      }

      // Start refresh
      isRefreshing = true;
      try {
        const newAccess = await refreshRequest();
        onRefreshed(newAccess);
        isRefreshing = false;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newAccess}`;
        return config;
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        throw err;
      }
    } catch (err) {
      // Pass error to response interceptor handling
      return Promise.reject(err);
    }
  },
  (err) => Promise.reject(err)
);

// Response interceptor to catch 401s and attempt a refresh/retry once
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;
    if (!originalReq) return Promise.reject(error);

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        const newAccess = await refreshRequest();
        originalReq.headers = originalReq.headers || {};
        originalReq.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalReq); 
      } catch (e) {
        localStorage.removeItem("accessToken");
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default API;