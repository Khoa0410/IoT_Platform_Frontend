import axios from "axios";
import Cookies from "js-cookie";

// export const baseURL = "http://localhost:3001/api";
// export const backendURL = "http://localhost:3001"; // URL cho backend, dùng trong socketService.js
export const baseURL = "https://daemicu.id.vn/api";
export const backendURL = "https://daemicu.id.vn"; // URL cho backend, dùng trong socketService.js

const api = axios.create({
  baseURL,
  withCredentials: true, // Cho phép gửi cookie HttpOnly từ backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Giữ access token trong memory
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// Interceptor để tự động thêm token vào headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý tự động refresh token khi access token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken;
        setAccessToken(newAccessToken);

        // Gắn lại token mới vào header và gửi lại request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
