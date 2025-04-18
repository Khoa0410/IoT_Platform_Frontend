import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ element }) => {
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? element : <Navigate to="/" />;
};

export default PrivateRoute;
