import React from "react";
import { Navigate } from "react-router-dom";

// Kiểm tra token trong localStorage
const PrivateRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token"); // Kiểm tra token trong localStorage

  // Nếu có token, render component, nếu không chuyển hướng về login
  return token ? Component : <Navigate to="/login" />;
};

export default PrivateRoute;
