import React, { createContext, useState, useEffect } from "react";

// Tạo AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Initialize user with null to handle empty state

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user"); // Clear invalid user data
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
