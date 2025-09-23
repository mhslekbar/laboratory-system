import React from "react";
import { useNavigate } from "react-router-dom";
import { MdDangerous } from "react-icons/md";

interface ErrorMsgInterface {
  error: string, 
  modal: any
}

const ErrorMsg:React.FC<ErrorMsgInterface> = ({ error, modal}) => {
  const navigate = useNavigate();
  return (
    <>
      {modal && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="fixed inset-0 w-full h-full bg-black opacity-40"
          ></div>
          <div className="flex items-center min-h-screen px-4 py-8">
            <div className="relative max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg w-2/5">
              <div className="flex items-center justify-center flex-col mt-3">
                {/* Start Modal Body */}
                <p style={{ fontWeight: "bold" }}>{error}</p>
                <MdDangerous
                  className="text-red"
                  style={{ fontSize: "10rem" }}
                  onClick={() => navigate("/")}
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

export default ErrorMsg;
