import React from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";

interface props {
  modal: boolean,
  toggle: any
}

const SuccessMsg:React.FC<props> = ({ modal, toggle }) => {
  return (
    <>
      {modal && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="fixed inset-0 w-full h-full bg-black opacity-40"
            onClick={toggle}
          ></div>
          <div className="flex items-center min-h-screen px-4 py-8">
            <div className="relative w-80 max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
              <div className="flex items-center justify-center flex-col mt-3">
                {/* Start Modal Body */}
                <BsFillCheckCircleFill
                  className="text-main"
                  style={{ fontSize: "10rem" }}
                />
                {/* End Modal Body */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessMsg;
