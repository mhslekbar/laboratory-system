import React from 'react'
import ShowPermissions from '../components/permissions/ShowPermissions'
import { useTranslation } from 'react-i18next'

const Permissions:React.FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className='text-center text-3xl mb-4'>{t("Permissions")}</h1>
      <ShowPermissions />
    </div>
  )
}

export default Permissions
