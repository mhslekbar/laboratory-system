import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { homePageFr } from "./french/homePageFr";
import { homePageAr } from "./arabic/homePageAr";
import { roleFr } from "./french/roleFr";
import { roleAr } from "./arabic/roleAr";
import { loginFr } from "./french/loginFr";
import { loginAr } from "./arabic/loginAr";
import { userFr } from "./french/userFr";
import { userAr } from "./arabic/userAr";

const resources = {
  ar: {
    translation: Object.assign(userAr, roleAr, loginAr, homePageAr)
  },
  fr: {
    translation: Object.assign(userFr, roleFr, loginFr, homePageFr)
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lang") ?? "fr",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;