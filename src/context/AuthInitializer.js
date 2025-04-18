import { useContext, useEffect } from "react";
import api, { setAccessToken } from "../api/AxiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const AuthInitializer = () => {
  const { setUser, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== "/" && currentPath !== "/login") {
      sessionStorage.setItem("lastPath", currentPath);
    }
  }, [location]);

  // Tự động kiểm tra và refresh access token khi ứng dụng khởi động
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await api.post(
          "/auth/refresh-token",
          {},
          { withCredentials: true }
        );
        const { accessToken, user: userInfo } = res.data;

        setAccessToken(accessToken);
        setUser(userInfo);
        setIsLoggedIn(true);

        const lastPath = sessionStorage.getItem("lastPath");
        if (lastPath && lastPath !== "/login") {
          navigate(lastPath);
        }

        console.log("Logged in successfully");
      } catch (error) {
        console.log("Not logged in or refresh token expired");
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    initializeAuth();
  }, [navigate, setIsLoggedIn, setUser]);

  return null;
};

export default AuthInitializer;
