import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsExclamationCircle } from "react-icons/bs"

const NotAuthorized:React.FC = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-start p-6">
      <h1 className="text-4xl">{t("Vous n'etes pas autoriser a acceder a cette page")}</h1>
      <BsExclamationCircle className="bg-red-500 text-white rounded w-20 h-20 my-2 p-4" /> 
    </div>
  )
}

export default NotAuthorized
