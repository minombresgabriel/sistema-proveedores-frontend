import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.rol !== "admin") {
      return <Navigate to="/" />;
    }
  } catch (err) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
