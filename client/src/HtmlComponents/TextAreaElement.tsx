import React from "react";

interface props {
  name?: string,
  labelName?: string,
  placeholder?: string,
  id?: string,
  value: any,
  setValue: (value: any) => void,
  divClass?: string,
  labelClass?: string,
  textAreaClass?: string,
  disabled?: boolean
}

export const TextAreaElement:React.FC<props> = ({ name, labelName, id, value, setValue, placeholder, divClass = "", disabled = false, labelClass, textAreaClass = ""}) => {
  return (
    <div className={`mb-2 ${divClass}`}>
      {labelName && 
        <label htmlFor={id} className={`block text-gray-700 font-bold w-fit ${labelClass}`}>
          {labelName}
        </label>
      }
      <textarea 
        id={id}
        className={`w-full shadow rounded border px-3 py-2 text-gray-700 focus:outline-none ${textAreaClass}`}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        defaultValue={value}
      >
      </textarea>
    </div>
  );
};

