import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

const Example = () => {
  const [modal, setModal] = useState(false)
  const toggle = () => {
    setModal(!modal)
  }
  return (
    <div>
        <button className="p-2 rounded bg-main text-white" onClick={toggle}>
          <FaPlus />
        </button>
      {modal && (
        <>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div
              className="fixed inset-0 w-full h-full bg-black opacity-40"
              onClick={toggle}
            ></div>
            <div className="flex items-center min-h-screen px-4 py-8">
              <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                <div className="mt-3">
                  {/* Start Modal Body */}
                  <form
                    className="mt-2 sm:ml-4 sm:text-left"
                  >
                      {/* My Inputs */}

                    {/* START Modal Footer */}
                    <div className="items-center gap-2 mt-3 sm:flex">
                      <button
                        type="submit"
                        className="w-full mt-2 p-2.5 flex-1 text-white bg-main rounded-md outline-none"
                      >
                        Ajouter
                      </button>
                      <button
                        className="w-full mt-2 p-2.5 flex-1 bg-gray-600 text-white rounded-md outline-none border"
                        onClick={toggle}
                      >
                        Fermer
                      </button>
                    </div>
                    {/* End Modal Footer */}
                  </form>
                  {/* End Modal Body */}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Example
