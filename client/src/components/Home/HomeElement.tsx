import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { State } from "../../redux/store";
import { PermissionInterface } from "../permissions/types";

interface props {
  Name: string,
  className: string,
  permissionName?: string,
  collectionName?: string,
  imgLink: string,
  pageLink: string,
  dev?: boolean,
  doctor?: boolean,
}

const HomeElement:React.FC<props> = ({ Name, className, permissionName, collectionName, imgLink, pageLink, dev, doctor }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()    
  const { permissions } = useSelector((state: State) => state.permissions)

  if(dev) {
    return (
    <div className={className} onClick={() => navigate(pageLink)}>
      <img width={"50px"} height={"50px"} src={imgLink} alt={Name} />
      <b className="text-xl mt-2">{t(Name)}</b>
    </div>)
  }

  if(doctor) {
    return (<div className={className} onClick={() => navigate(pageLink)}>
      <img
        width={"50px"}
        height={"50px"}
        src={imgLink}
        alt={Name}
      />
      <b className="text-xl mt-2">{t(Name)}</b>
    </div>)
  }

  return (
    <>
      {permissions.find(
        (permission: PermissionInterface) =>
          permission.name === permissionName &&
          permission.collectionName === collectionName
      ) && (
        <div className={className} onClick={() => navigate(pageLink)}>
          <img
            width={"50px"}
            height={"50px"}
            src={imgLink}
            alt={Name}
          />
          <b className="text-xl mt-2">{t(Name)}</b>
        </div>
      )}
    </>
  );
};

export default HomeElement;
