import React from "react";
import type { ModuleDef } from "../layout/WorkspaceLayout";
import DoctorHome from "./modules/Home";
import DoctorCases from "./modules/Cases";
import DoctorPatients from "./modules/Patients";
import { FaBriefcaseMedical } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi2";
import { MdHome } from "react-icons/md";

export const DoctorModules: ModuleDef[] = [
  { path: "", label: "Accueil",   element: <DoctorHome />,    icon: <MdHome />, index: true },
  { path: "dossiers", label: "Dossiers", element: <DoctorCases />, icon: <FaBriefcaseMedical /> },
  { path: "patients", label: "Patients", element: <DoctorPatients />, icon: <HiUserGroup /> },
];
