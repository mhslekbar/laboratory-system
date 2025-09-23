import React from "react";
import { useTranslation } from "react-i18next";
import { CiCircleRemove } from "react-icons/ci";

interface props {
  errors: string[];
  setErrors: any;
  customClass?: string
}

const ShowErrorMsg: React.FC<props> = ({ errors, setErrors, customClass }) => {
  
  const hideMsg = (theMsg: string, error: string[], setError: any) => {
    setError(
      error.filter(
        (err: any) => err?.toUpperCase()?.trim() !== theMsg?.toUpperCase()?.trim()
      )
    );
  };

  const { t } = useTranslation()
  
  return (
    <>
      {errors.length > 0 &&
        errors.map((err: any, index) => (
          <div
            className={`${customClass ?? "bg-red"} p-3 my-2 rounded text-white msg flex justify-between`}
            key={index}
          >
            <span>{t(err)}</span>
            <CiCircleRemove className="bg-white text-xl text-red rounded-full font-bold" onClick={() => hideMsg(err, errors, setErrors)}/>
          </div>
        ))}
    </>
  );
};

export default ShowErrorMsg;

