// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.level)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
