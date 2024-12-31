import axios from "axios";

// Tạo một instance của Axios
const api = axios.create({
  // baseURL: 'http://localhost:3001/api',
  baseURL: "https://iot-platform-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi từ server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi 401 Unauthorized (ví dụ: điều hướng tới trang đăng nhập)
      console.error("Unauthorized! Redirecting to login...");
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
