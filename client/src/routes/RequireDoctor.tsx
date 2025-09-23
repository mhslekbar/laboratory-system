import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { State } from "../redux/store";

export default function RequireDoctor({ children }: { children: React.ReactNode }) {
  const { userData } = useSelector((s: State) => s.login);
  const ok = !!userData?.doctor?.isDoctor;
  return ok ? <>{children}</> : <Navigate to="/" replace />;
}
