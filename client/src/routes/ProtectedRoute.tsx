// src/routes/ProtectedRoute.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { State } from "../redux/store";

const ProtectedRoutes: React.FC = () => {
  const { userData } = useSelector((state: State) => state.login);
  const isLoggedIn = Boolean(userData?._id);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
