import React, {  } from 'react'
import { ShowPermissionApi } from '../../redux/permissions/permissionApiCalls';
import { useDispatch } from 'react-redux';
import { UserData } from '../../requestMethods';
import HomeElement from './HomeElement';

const HomeLinksPage: React.FC = () => {
  const className = `px-10 py-6 bg-white hover:bg-main rounded-lg border flex flex-col justify-center items-center text-main`;
  const dispatch: any = useDispatch();

  const fetchPermission = async () => {
    await dispatch(ShowPermissionApi(`?userId=${UserData()._id}`));
  };
  // !localStorage.getItem("timeOut") && 
  fetchPermission();
  // useEffect(() => {
  //   setTimeout(() => {
  //     localStorage.setItem("timeOut", "true")
  //   }, 1000)
  // }, [dispatch]);

  return (
  <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-3'>
    
    <HomeElement Name='Utilisateurs' className={className} permissionName="AFFICHER" collectionName='UTILISATEURS' pageLink={`/user`} imgLink='assets/images/user.png' />      
    <HomeElement Name='Roles' className={className} permissionName="AFFICHER" collectionName='ROLES' pageLink={`/role`} imgLink='assets/images/roles.png' />      
    
    <HomeElement dev={true} Name='Permissions' className={className} pageLink={`/permissions`} imgLink='assets/images/shield.png' />          
  </div>
  )


}

export default HomeLinksPage

