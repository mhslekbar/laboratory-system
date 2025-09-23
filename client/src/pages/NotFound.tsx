import React from 'react'
import { BsExclamationCircle } from "react-icons/bs"

const NotFound:React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start p-6">
      <h1 className="text-4xl">404 Page Not Found </h1>
      <BsExclamationCircle className="bg-red-500 text-white rounded w-20 h-20 my-2 p-4" /> 
    </div>
  )
}

export default NotFound
