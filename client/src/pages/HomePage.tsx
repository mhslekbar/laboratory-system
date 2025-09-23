import React, { useState } from 'react'
import HomeLinksPage from '../components/Home/HomeLinksPage';
import { useTranslation } from 'react-i18next';
import { TbLanguage } from "react-icons/tb"
import { useSelector } from 'react-redux';
import { State } from '../redux/store';

const HomePage:React.FC = () => {
  const { i18n }  = useTranslation()
  const [showLangs, setShowLangs] = useState(false)
  
  const changeLangs = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem("lang", lng)
    setShowLangs(false)
    switch(lng) {
      case "ar": 
        document.body.dir = "rtl";
        localStorage.setItem("dir", "rtl")
      break;
      default:
        document.body.dir = "ltr";
        localStorage.setItem("dir", "ltr")  
    }
  }

  const { userData } = useSelector((state: State) => state.login)

  return (
    <div>
      <section className='relative'>
        <button className='bg-main p-2 rounded border' onClick={() => setShowLangs(!showLangs)}>
          <TbLanguage className='text-2xl' />
        </button>
        {showLangs && <div className='absolute bg-white w-fit shadow-lg z-10'>
          <p className={`p-2 hover:bg-main ${localStorage.getItem("lang") === "ar" ? "bg-main" : ""}`} onClick={() => changeLangs("ar")}>العربية</p>
          {/* <p className={`p-2 hover:bg-main ${localStorage.getItem("lang") === "en" ? "bg-main" : ""}`} onClick={() => changeLangs("en")}>English</p> */}
          <p className={`p-2 hover:bg-main ${localStorage.getItem("lang") === "fr" ? "bg-main" : ""}`} onClick={() => changeLangs("fr")}>Francais</p>
        </div>}        
      </section>
      {userData.username && <HomeLinksPage />}
    </div>
  )
}

export default HomePage
