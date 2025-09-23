import React from "react";
import { useTranslation } from "react-i18next";

type props = {
  toggle: () => void;
  typeBtn: string;
  loading?: boolean
};

const ButtonsForm: React.FC<props> = ({
  toggle,
  typeBtn,
  loading
}) => {
  let btnColor;
  switch (typeBtn) {
    case "Ajouter":
      btnColor = "bg-main";
      break;
    case "Modifier":
      btnColor = "bg-second";
      break;
    case "Supprimer":
      btnColor = "bg-red";
      break;
    case "Passer":
      btnColor = "bg-yellow";
      break;
    case "Terminer":
      btnColor = "bg-main";
      break;
    default:
      btnColor = "bg-main";
  }

  const { t } = useTranslation()

  return (
    <div className="items-center gap-2 mt-3 sm:flex">
      <button
        type="submit"
        // className={`w-full mt-2 p-2.5 flex-1 text-white ${btnColor} rounded-md outline-none`}
        className={`w-full mt-2 p-2.5 flex-1 text-white ${btnColor} rounded-md outline-none ${
          loading ? 'bg-gray-400 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {t(typeBtn)}
      </button>
      <button
        className="w-full mt-2 p-2.5 flex-1 bg-gray-600 text-white rounded-md outline-none border"
        onClick={toggle}
      >
        {t("Fermer")}
      </button>
    </div>
  );
};

export default ButtonsForm;
