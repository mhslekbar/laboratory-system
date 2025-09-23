import React from 'react'
import { useTranslation } from 'react-i18next';


type props = {
  toggle?: any;
  type?: any,
  typeBtn?: string;
  loading?: boolean,
  className?: string,
  icon?: any
};

const ButtonElement = ({ className, toggle, type="button", typeBtn, loading, icon }: props) => {
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
    // className={`w-full mt-2 p-2.5 flex-1 text-white ${btnColor} rounded-md outline-none`}
  return (
    <button
      type={type}
      className={`w-full mt-2 p-2.5 flex items-center justify-center text-white ${btnColor} hover:font-bold rounded-md outline-none ${className} ${
        loading ? 'bg-gray-400 cursor-not-allowed' : ''
      }`}
      disabled={loading}
      onClick={toggle}
    >
      {icon ? icon : t(typeBtn ?? "")}
    </button>
  )
}

export default ButtonElement