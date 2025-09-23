import React, { useRef } from "react";
import { BiImageAdd } from "react-icons/bi";

interface props {
  type?: string,
  name?: string,
  id?: string,
  setValue: (value: any) => void,
  divClass?: string,
  disabled?: boolean,
  accept?: string
  labelClass?: string,
}

export const InputImage:React.FC<props> = ({ type = "file", name, id, setValue, divClass = "", disabled = false, accept, labelClass = ""}) => {
  
  const uploadInput: any = useRef(null)

  return (
    <div className={`mb-2 ${divClass}`}>
      {name && 
        <label htmlFor={id} className={`block text-gray-700 font-bold w-fit ${labelClass}`}>
          {name}
        </label>
      }
      <BiImageAdd className="text-4xl text-second w-full" onClick={() => uploadInput.current.click()}/> 
      <input
        ref={uploadInput}
        type={type}
        id={id}
        className={`hidden bg-white w-full shadow rounded border px-3 py-2 text-gray-700 focus:outline-none`}
        disabled={disabled}
        accept={accept}
        onChange={(e: any) => setValue(e.target.files[0])}
      />
    </div>
  );
};

