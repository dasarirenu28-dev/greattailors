// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // <-- must match where you save it
  if (!token) return <Navigate to="/" replace />; // force login
  return children;
}
