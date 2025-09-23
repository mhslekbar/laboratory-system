import React, { useEffect, useRef, useState } from "react";
import {
  HiOutlineBell,
  HiChevronDown,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineMenu,
} from "react-icons/hi";
import { AiOutlinePoweroff } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../../redux/login/loginApiCalls";
import { clearUserApi } from "../../redux/users/UserApiCalls";
import { clearRoleApi } from "../../redux/roles/roleApiCalls";
import { clearPermissionApi } from "../../redux/permissions/permissionApiCalls";
import { useTranslation } from "react-i18next";
import { hostName } from "../../requestMethods";
import { useGeneralSettings } from "../../hooks/useGeneralSettings";
import { useTheme } from "../../hooks/useTheme";

interface HeaderProps {
  toggleOffcanvas?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleOffcanvas }) => {
  const { userData } = useSelector((s: State) => s.login);
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // theme
  const { isDark, toggle } = useTheme();

  // user dropdown
  const [openUser, setOpenUser] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenUser(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenUser(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutApi());
      await dispatch(clearPermissionApi());
      await dispatch(clearRoleApi());
      await dispatch(clearUserApi());
      localStorage.removeItem("timeOut");
      localStorage.removeItem("StoreType");
      navigate("/login", { replace: true });
    } catch {}
  };

  const handleHomeClick = () => {
    if (userData?.username) navigate("/");
    else if (!userData?._id && typeof toggleOffcanvas === "function")
      toggleOffcanvas();
  };

  const initials = (
    userData?.name ||
    userData?.fullName ||
    userData?.username ||
    "User"
  )
    .split(" ")
    .map((w: string) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const settings = useGeneralSettings();

  return (
    <header
      role="navigation"
      className="sticky top-0 z-50 bg-primary text-white border-b border-surface dark:border-gray-700 shadow-md dark:shadow-none"
    >
      <div className="mx-auto max-w-screen-2xl h-16 px-3 md:px-6 flex items-center gap-3">
        {/* left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleOffcanvas}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white text-primary border border-white"
          >
            <HiOutlineMenu className="text-xl" />
          </button>
          <button
            type="button"
            onClick={handleHomeClick}
            className="group flex items-center gap-2 rounded-md bg-white text-primary border border-white px-3 py-2"
          >
            <img
              src={
                settings?.company?.logoUrl
                  ? `${hostName}${settings.company.logoUrl}`
                  : "/assets/logo/dental-lab.jpg"
              }
              alt="logo"
              className="w-8 h-8 rounded object-cover"
            />
            <span className="hidden sm:block font-bold tracking-wide uppercase">
              {settings?.company?.name || "DENTAL LAB SYS"}
            </span>
          </button>
        </div>

        {/* center search */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary dark:text-neutralDark">
              <HiOutlineSearch />
            </span>
            <input
              type="text"
              placeholder={t("Rechercher...")}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface dark:bg-[#111827] text-neutral dark:text-neutral border border-surface dark:border-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* right */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center p-2 rounded-md bg-white text-primary border border-white"
          >
            {isDark ? <HiOutlineSun className="text-lg" /> : <HiOutlineMoon className="text-lg" />}
          </button>

          <button
            type="button"
            className="hidden sm:inline-flex items-center justify-center p-2 rounded-md bg-white text-primary border border-white"
          >
            <HiOutlineBell className="text-lg" />
          </button>

          {userData?.username || userData?.fullName ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpenUser((o) => !o)}
                className="inline-flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full bg-white text-primary border border-white"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface dark:bg-[#111827] text-primary font-bold">
                  {initials}
                </span>
                <HiChevronDown className="text-base" />
              </button>
              {openUser && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 border border-surface dark:border-gray-700 shadow-lg">
                  <div className="px-4 py-3">
                    <p className="text-sm opacity-80">{t("Connecté en tant que")}</p>
                    <p className="font-semibold truncate">
                      {userData?.username || userData?.fullName}
                    </p>
                  </div>
                  <div className="h-px bg-surface dark:bg-gray-700" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover-bg-danger"
                  >
                    <AiOutlinePoweroff className="text-lg" />
                    <span className="font-semibold">{t("Se déconnecter")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center p-2 rounded-md bg-white text-primary border border-white"
            >
              <img className="w-6 h-6" src="/assets/images/key.png" alt="login" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
