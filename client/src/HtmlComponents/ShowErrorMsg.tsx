import React from "react";
import { useTranslation } from "react-i18next";
import { CiCircleRemove } from "react-icons/ci";

interface Props {
  errors: string[];
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
  customClass?: string;
}

const ShowErrorMsg: React.FC<Props> = ({ errors, setErrors, customClass }) => {
  const { t } = useTranslation();

  const hideMsg = (theMsg: string) => {
    setErrors((prev) =>
      prev.filter((err: any) => {
        return err?.toUpperCase()?.trim() !== theMsg?.toUpperCase()?.trim();
      })
    );
  };

  return (
    <>
      {errors.length > 0 &&
        errors.map((err, index) => (
          <div
            key={index}
            className={`${
              customClass ?? "bg-red-500"
            } p-3 my-2 rounded text-white flex justify-between items-center`}
          >
            <span>{t(err)}</span>
            <CiCircleRemove
              className="cursor-pointer text-xl text-red-600 bg-white rounded-full"
              onClick={() => hideMsg(err)}
            />
          </div>
        ))}
    </>
  );
};

export default ShowErrorMsg;
