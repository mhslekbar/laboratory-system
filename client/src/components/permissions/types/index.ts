import { createContext } from "react"

export interface DataPermissionInterface {
  name: string,
  setName: (name: string) => void,
  collectionName: string,
  setCollectionName: (collectionName: string) => void,
}

export const DefaultDataPermissionInterface: DataPermissionInterface = {
  name: "",
  setName: () => {},
  collectionName: "",
  setCollectionName: () => {},
}

export const DataPermissionContext = createContext(DefaultDataPermissionInterface) 

export interface PermissionInterface {
  _id: string, 
  name: string,
  collectionName: string,
  createdAt: string,
  updatedAt: string,
}

export const DefaultPermissionInterface: PermissionInterface = {
  _id: "", 
  name: "",
  collectionName: "",  
  createdAt: "",
  updatedAt: "",
}

export interface ShowPermissionInterface {
  showSuccesMsg: boolean,
  setShowSuccesMsg: (showSuccesMsg: boolean) => void,
  showEditModal: boolean,
  setShowEditModal: (showEditModal: boolean) => void,
  showDeleteModal: boolean,
  setShowDeleteModal: (showDeleteModal: boolean) => void,
  selectedPermission: PermissionInterface,
  setSelectedPermission: (selectedPermission: PermissionInterface) => void,
}

export const DefaultShowPermissionInterface: ShowPermissionInterface = {
  showSuccesMsg: false,
  setShowSuccesMsg: () => {},
  showEditModal: false,
  setShowEditModal: () => {},
  showDeleteModal: false,
  setShowDeleteModal: () => {},
  selectedPermission: DefaultPermissionInterface,
  setSelectedPermission: () => {},
}

export const ShowPermissionContext = createContext(DefaultShowPermissionInterface)

