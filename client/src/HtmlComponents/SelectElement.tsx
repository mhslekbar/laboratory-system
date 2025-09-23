import React from "react";
import { useTranslation } from "react-i18next";

interface SelectElementInterface {
  name?: string;
  id?: string;
  value: any;
  setValue: (value: any) => void;
  options: any;
  defaultOption?: any,
  valueType?: string, // is important to specify which type of value do you need string | object
  showPrice?: boolean, // show price of Treatment lab 
  divClass?: string,
  labelClass?: string,
}

export const SelectElement: React.FC<SelectElementInterface> = ({
  name,
  id,
  value,
  setValue,
  options,
  defaultOption,
  valueType = "string",
  showPrice = false,
  divClass = "",
  labelClass = ""
}) => {

  const { t } = useTranslation()
  return (
    <div className={`mb-2 ${divClass}`}>
      {name && 
        <label htmlFor={id} className={`block text-gray-700 font-bold w-fit ${labelClass}`}>
          {name}
        </label>
      }
      <select
        className="w-full shadow rounded border px-3 py-2 text-gray-700 focus:outline-none"
        id={id}
        // value={value._id}
        value={valueType === "object" ? value._id : value}
        onChange={(e) => {
          const index = e.target.selectedIndex;
          valueType === "object" ? 
            setValue(JSON.parse(e.target.options[index].getAttribute("data-element") || ""))
          :
            setValue(e.target.options[index].value)
        }}
      >
        {defaultOption}
        {options.map((option: any) => {
          return <option value={option._id} data-element={JSON.stringify(option)} key={option._id}>{t(option.name)}</option>
        })}
      </select>
    </div>
  );
};
