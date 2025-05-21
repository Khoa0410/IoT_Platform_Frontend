import React, { createContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../api/AxiosConfig";

// Tạo AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = (accessToken, userInfo) => {
    setAccessToken(accessToken);
    setIsLoggedIn(true);
    setUser(userInfo);
  };

  const logout = async () => {
    try {
      // Gửi yêu cầu logout tới backend
      await api.post("/auth/logout", {}, { withCredentials: true });

      // Sau khi logout, xóa token và user trong context
      setAccessToken(null);
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
