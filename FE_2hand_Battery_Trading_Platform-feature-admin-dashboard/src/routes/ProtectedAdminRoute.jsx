import React from "react";
import { Navigate } from "react-router-dom";

export const ProtectedAdminRoute = ({ children }) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  if (!adminUser?.token || adminUser?.role === "CUSTOMER") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};
