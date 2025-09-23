import React from 'react'
import ShowRoles from '../components/roles/ShowRoles'
import { useTranslation } from 'react-i18next'

const Roles:React.FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className='text-center text-3xl'>{t("Roles")}</h1>
      <ShowRoles />
    </div>
  )
}

export default Roles
