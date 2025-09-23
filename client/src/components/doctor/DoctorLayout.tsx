import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { State } from "../../redux/store";
import WorkspaceLayout from "../layout/WorkspaceLayout";
import { DoctorModules } from "./DoctorModules";
import { logoutApi } from "../../redux/login/loginApiCalls";

export default function DoctorLayout() {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((s: State) => s.login);

  const doctorName = userData?.fullName || userData?.username || "Médecin";
  const title = `DR. ${doctorName}`;

  const onLogout = async () => {
    await dispatch(logoutApi());
    navigate("/login", { replace: true });
  };

  return (
    <WorkspaceLayout
      title={title}
      basePath="/doctor"
      modules={DoctorModules}
      onLogout={onLogout}
      subtitle="Espace médecin"
    />
  );
}
