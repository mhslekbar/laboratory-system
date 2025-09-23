// src/routes/AdminRoutes

// src/routes/AdminRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoutes from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";

import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import NotAuthorized from "../pages/NotAuthorized";

import Users from "../pages/Users";
import Roles from "../pages/Roles";
import Permissions from "../pages/Permissions";
import LayoutApp from "../pages/LayoutApp";

// (اختياري) صفحات مستقبلية
import Patients from "../pages/Patients";
import MeasurementTypePage from "../pages/MeasurementTypePage";
import CasesPage from "../pages/CasesPage";
import StatsPage from "../pages/StatsPage";
import Dashboard from "../components/dashboard/Dashboard";
import SettingsPage from "../pages/SettingsPage";
import DoctorLayout from "../components/doctor/DoctorLayout";
import RequireDoctor from "./RequireDoctor";
import SmartLanding from "../pages/SmartLanding";
import { useSelector } from "react-redux";
import { State } from "../redux/store";

const AdminRoutes: React.FC = () => {
  const { userData } = useSelector((state: State) => state.login)
  
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoutes />}>
        {/* Espace Doctor */}
        <Route
          path="/doctor/*"
          element={
            <RequireDoctor>
              <DoctorLayout />
            </RequireDoctor>
          }
        />

        {/* Espace Admin */}
        <Route element={<LayoutApp />}>
          <Route index element={<SmartLanding />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="users"
            element={
              <AuthRoute collectionName="UTILISATEURS" element={<Users />} />
            }
          />
          <Route
            path="cases"
            element={<AuthRoute collectionName="DOSSIERS" element={<CasesPage />} />}
          />
          <Route
            path="roles"
            element={<AuthRoute collectionName="ROLES" element={<Roles />} />}
          />
          
          <Route
            path="permissions"
            element={userData?.dev ? <Permissions /> : <NotAuthorized />}
          />
          <Route
            path="patients"
            element={<AuthRoute collectionName="PATIENTS" element={<Patients />} />}
          />
          <Route
            path="types"
            element={<AuthRoute collectionName="TYPES" element={<MeasurementTypePage />} />}
          />
          <Route
            path="stats"
            element={<AuthRoute collectionName="STATISTIQUES" element={<StatsPage />} />}
          />
          <Route
            path="settings"
            element={<AuthRoute collectionName="PARAMETRES" element={<SettingsPage />} />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;


    // <Routes>
    //   {/* صفحة عامة */}
    //   <Route path="/login" element={<Login />} />

    //   {/* مسارات محمية داخل Layout (Header + Navbar) */}
    //   <Route element={<ProtectedRoutes />}>
    //     <Route element={<LayoutApp />}>
    //       <Route index element={<Dashboard />} />

    //       {/* Users محمية بواسطة AuthRoute */}
    //       <Route path="users" element={<Users />} />

    //       <Route path="dashboard" element={<Dashboard />} />

    //       {/* Cases متاحة لكل المستخدمين المسجلين */}
    //       <Route path="cases" element={<CasesPage />} />

    //       {/* Roles محمية بواسطة AuthRoute */}
    //       <Route path="roles" element={<Roles />} />

    //       {/* Permissions مرئية فقط للمطورين (dev) وإلا NotAuthorized */}
    //       <Route
    //         path="permissions"
    //         element={<Permissions />}
    //         // element={userData?.dev ? <Permissions /> : <NotAuthorized />}
    //       />

    //       {/* (اختياري) أمثلة لمسارات لاحقة */}
    //       <Route path="patients" element={<Patients />} />
    //       <Route path="types" element={<MeasurementTypePage />} />
    //       <Route path="stats" element={<StatsPage />} />
    //       <Route path="settings" element={<SettingsPage />} />

    //       {/* 404 داخل التطبيق */}
    //       <Route path="*" element={<NotFound />} />
    //     </Route>
    //   </Route>

    //   {/* 404 للطرق الخارجة عن النطاق (مثلاً لو أحد كتب مسار غلط خارج الـLayout) */}
    //   <Route path="*" element={<NotFound />} />
    // </Routes>