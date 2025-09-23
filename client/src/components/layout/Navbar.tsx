import React, { useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineUserCircle,
  HiOutlineCollection,
  HiOutlineChartPie,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineCog
} from "react-icons/hi";
import { State } from "../../redux/store";
import { PermissionType } from "../roles/types";
import { useDispatch } from "react-redux";
import { ShowPermissionApi } from "../../redux/permissions/permissionApiCalls";
import { fetchCases } from "../../redux/cases/thunks";
import { fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";
import { ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import { showRolesApi } from "../../redux/roles/roleApiCalls";
import { fetchGeneralSettings } from "../../redux/settings/settingsApiCalls";
import { fetchTodos } from "../../redux/todos/todoApiCalls";
import { ShowUserApi } from "../../redux/users/UserApiCalls";

/* ----------------------------- Types ----------------------------- */
type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  /** اسم الـcollection في نظام الصلاحيات (اختياري: العناصر العامة تترك بدون collectionName) */
  collectionName?: string;
  /** اسم الإذن المطلوب (افتراضي "AFFICHER") */
  permName?: string;
  /** إظهار فقط للمطورين (dev) */
  onlyDev?: boolean;
};

/* --------------------------- Base Link --------------------------- */
const BaseLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `
        group inline-flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap
        transition-colors text-sm font-semibold border
        ${isActive
          ? "bg-primary text-white border-primary"
          : "bg-white text-primary border-white hover:bg-primary hover:text-white"
        }
      `
      }
    >
      {children}
    </NavLink>
  );
};

/* ----------------------- Helper: hasPerm ------------------------- */
const useHasPermission = () => {
  const { permissions = [] } =
    (useSelector((s: State) => (s as any).permissions) as {
      permissions: PermissionType[];
      loading?: boolean;
    }) || { permissions: [] };

  return useMemo(
    () => (collectionName?: string, permName: string = "AFFICHER") => {
      if (!collectionName) return true; // عناصر عامة لا تحتاج صلاحية
      const p = (permName || "").trim().toUpperCase();
      const c = (collectionName || "").trim().toUpperCase();
      return permissions?.some(
        (perm: PermissionType) =>
          (perm?.name || "").toUpperCase() === p &&
          (perm?.collectionName || "").toUpperCase() === c
      );
    },
    [permissions]
  );
};

/* ------------------------- Navbar Items -------------------------- */
/** حدّث أسماء الـcollectionName حسب ما لديك في الباك/الـRedux */
const navItems: NavItem[] = [
  { label: "Dashboard",        to: "/dashboard",   icon: <HiOutlineHome /> }, // عام
  { label: "Cases",            to: "/cases",       icon: <HiOutlineClipboardList />, collectionName: "DOSSIERS" },
  { label: "Patients",         to: "/patients",    icon: <HiOutlineUserGroup />,      collectionName: "PATIENTS" },
  { label: "Doctors / Users",  to: "/users",       icon: <HiOutlineUserCircle />,     collectionName: "UTILISATEURS" },
  { label: "Types",            to: "/types",       icon: <HiOutlineCollection />,     collectionName: "TYPES" },
  { label: "Statistics",       to: "/stats",       icon: <HiOutlineChartPie />,       collectionName: "STATISTIQUES" },
  { label: "Roles",            to: "/roles",       icon: <HiOutlineShieldCheck />,    collectionName: "ROLES" },
  { label: "Permissions",      to: "/permissions", icon: <HiOutlineKey />,            onlyDev: true },
  { label: "Settings",         to: "/settings",    icon: <HiOutlineCog />,            collectionName: "PARAMETRES" },
];

/* ---------------------------- Navbar ----------------------------- */
const Navbar: React.FC = () => {
  const { userData } = useSelector((state: State) => state.login)
  const hasPerm = useHasPermission();
  const isDev = Boolean(userData?.dev);

    const dispatch: any = useDispatch();
  
    useEffect(() => {
      // Charger/rafraîchir les permissions au montage
      setTimeout(() => {
        dispatch(ShowPermissionApi(`?userId=${userData._id}`));
        localStorage.setItem("timeOut", "true");
      }, 1000);
      dispatch(fetchCases());
      dispatch(fetchMeasurementTypes());
      dispatch(ShowPatientApi());
      dispatch(showRolesApi());
      dispatch(fetchGeneralSettings());
      dispatch(fetchTodos());
      dispatch(ShowUserApi());
    }, [dispatch, userData]);

  const visibleItems = useMemo(() => {
    return navItems.filter((it) => {
      if (it.onlyDev) return isDev;
      return hasPerm(it.collectionName, it.permName ?? "AFFICHER");
    });
  }, [hasPerm, isDev]);

  return (
    <nav
      className="
        sticky top-16 z-10
        bg-surface dark:bg-[#111827]
        border-b border-surface dark:border-gray-700
        shadow-sm
      "
      role="navigation"
      aria-label="Secondary navigation"
    >
      {/* قابلة للتمرير أفقيًا على الجوال */}
      <div className="mx-auto max-w-screen-2xl px-3 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {visibleItems.map((item) => (
            <BaseLink key={item.to} to={item.to}>
              <span className="text-base">{item.icon}</span>
              <span className="uppercase">{item.label}</span>
            </BaseLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
