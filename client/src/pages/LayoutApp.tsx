// src/pages/LayoutApp.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";

const LayoutApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#111827]">
      <Header />
      <Navbar />
      <main className="mx-auto max-w-screen-2xl p-3 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutApp;
