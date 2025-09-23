import React, { useRef } from "react";
import { BiImageAdd } from "react-icons/bi";

interface props {
  name?: string,
  id?: string,
  divClass?: string,
  accept?: string,
  setImages: (images: File[] | any) => void
}

export const InputImages:React.FC<props> = ({ name, id, divClass = "", setImages}) => {
  
  const handleChangeImage = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
    
      const validImages = newImages.filter((file: any) => {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
      });
    
      setImages((prevImages: File[] | undefined) => {
        if (!prevImages) {
          return validImages;
        }
    
        const uniqueNewImages = validImages.filter((newImage: any) => {
          return !prevImages.some((img) => img.name === newImage.name);
        });
    
        return [...prevImages, ...uniqueNewImages];
      });
    }
  }

  const uploadInput: any = useRef(null)

  return (
    <div className={`mb-2 ${divClass}`}>
      {name && 
        <label htmlFor={id} className={`block text-gray-700 font-bold w-fit`}>
          {/* {name} */}
        </label>
      }
      <BiImageAdd  className="text-4xl text-second" onClick={() => uploadInput.current.click()}/> 
      <input
        ref={uploadInput}
        type="file"
        id={id}
        className={`hidden w-full shadow rounded border px-3 py-2 text-gray-700 focus:outline-none`}
        onChange={(e: any) => handleChangeImage(e)}
        multiple={true}
      />
    </div>
  );
};

