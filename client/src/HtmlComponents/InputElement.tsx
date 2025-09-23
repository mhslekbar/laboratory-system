import React from "react";

interface InputElementInterface {
  type?: string,
  name?: string,
  placeholder?: string,
  id?: string,
  value: any,
  setValue: (value: any) => void,
  divClass?: string,
  labelClass?: string,
  inputClass?: string,
  disabled?: boolean
}

export const InputElement:React.FC<InputElementInterface> = ({ type = "text", name, id, value, setValue, placeholder, divClass = "", inputClass = "", disabled = false, labelClass}) => {
  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;

    if(type === "date") {
      if(inputValue) {
        const newDate = new Date(inputValue);
        setValue(newDate.toISOString().split('T')[0]);
      }
    } else {
      setValue(e.target.value)
    }
  };

  return (
    <div className={`mb-2 ${divClass}`}>
      {name && 
        <label htmlFor={id} className={`block text-gray-700 font-bold w-fit ${labelClass}`}>
          {name}
        </label>
      }
      <input
        type={type}
        id={id}
        className={`${type !== "color" ? " w-full shadow rounded border px-3 py-2 text-gray-700 focus:outline-none" : ""} ${inputClass}`}
        placeholder={placeholder || name}
        value={value ?? ""}
        autoComplete="off"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
};
