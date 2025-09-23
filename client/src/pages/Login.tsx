import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginApi } from "../redux/login/loginApiCalls";
import { State } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ShowErrorMsg from "../HtmlComponents/ShowErrorMsg";
import { InputElement } from "../HtmlComponents/InputElement";
import { hostName } from "../requestMethods";
import { useGeneralSettings } from "../hooks/useGeneralSettings";
import { useTheme } from "../hooks/useTheme";

const Login: React.FC = () => {
  const { userData } = useSelector((state: State) => state.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const { isDark, toggle } = useTheme();

  const submitLogin = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response: any = await dispatch(loginApi({ username, password }));
      if (response === true) {
        setErrors([]);
      } else {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      setErrors([]);
      const goTo = userData?.doctor?.isDoctor ? "/doctor" : "/dashboard";
      navigate(goTo, { replace: true });
    }
  }, [navigate, userData]);

  const { t } = useTranslation();
  const settings = useGeneralSettings();

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#111827] transition-colors">
      <div className="w-full max-w-lg relative bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        {/* theme toggle */}
        <button
          type="button"
          onClick={toggle}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm font-medium bg-surface border border-surface dark:border-gray-600"
          title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          aria-pressed={isDark}
        >
          {isDark ? "🌞" : "🌙"}
        </button>

        <img
          className="w-full h-96 mb-4 rounded"
          src={
            settings?.company?.logoUrl
              ? `${hostName}${settings.company.logoUrl}`
              : "/assets/logo/dental-lab.jpg"
          }
          alt="dentist-logo"
        />

        <form onSubmit={submitLogin} className="space-y-4">
          <InputElement
            name={t("Username")}
            placeholder={t("Username")}
            value={username}
            setValue={setUsername}
          />
          <InputElement
            type="password"
            name={t("Password")}
            placeholder={t("Password")}
            value={password}
            setValue={setPassword}
          />
          <button
            className={`w-full py-2 px-4 font-bold text-white rounded focus:outline-none transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "btn-primary hover-bg-primary"
            }`}
            disabled={loading}
          >
            {t("Connecter")}
          </button>
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
        </form>
      </div>
    </section>
  );
};

export default Login;
