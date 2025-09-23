// src/components/users/types.ts
import { createContext } from "react";
import type { PermissionType } from "../../roles/types";

/* ---------- Domain Types ---------- */

export interface DoctorProfile {
  isDoctor: boolean;
  clinicName?: string;
  phone?: string;
}

export interface UserInterface {
  _id: string;
  fullName: string;
  username: string;
  /** ⚠️ Évite d'exposer le password dans l'UI, garde-le optionnel */
  password?: string;
  phone: string;
  roles: PermissionType[];
  doctor?: DoctorProfile; // undefined = non-médecin ou profil non renseigné
  dev: boolean;
  /** Évite any si possible, sinon unknown est plus safe */
  createdAt?: string;
  updatedAt?: string;
}

/* ---------- Safe Defaults ---------- */
/** ✅ doctor: isDoctor:false (au lieu de {}) pour respecter le type */
export const DefaultUserInterface: UserInterface = {
  _id: "",
  fullName: "",
  username: "",
  phone: "",
  roles: [],
  doctor: { isDoctor: false },
  dev: false,
  createdAt: undefined,
  updatedAt: undefined,
};

/* ---------- ShowUser Context Types ---------- */
export type ShowUserType = {
  successMsg: boolean;
  setSuccessMsg: React.Dispatch<React.SetStateAction<boolean>>;
  showAddModal:boolean; setShowAddModal: (showAddModal:boolean) => void; 
  showEditModal: boolean;
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;

  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;

  selectedUser: UserInterface;
  setSelectedUser: React.Dispatch<React.SetStateAction<UserInterface>>;
};

/** Valeurs par défaut “no-op” pour l’initialisation du createContext */
export const DefaultShowUserType: ShowUserType = {
  successMsg: false,
  setSuccessMsg: () => {},
  showAddModal: false, setShowAddModal: () => {}, 

  showEditModal: false,
  setShowEditModal: () => {},

  showDeleteModal: false,
  setShowDeleteModal: () => {},

  selectedUser: DefaultUserInterface,
  setSelectedUser: () => {},
};

/* ---------- AddUser Context Types ---------- */
/** ✅ setters en Dispatch<SetStateAction<T>> pour autoriser les updates fonctionnels */
export interface AddUserInterface {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;

  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;

  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;

  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;

  isDoctor: boolean;
  setIsDoctor: React.Dispatch<React.SetStateAction<boolean>>;

  clinicName: string;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;

  checkedRoles: PermissionType[];
  setCheckedRoles: React.Dispatch<React.SetStateAction<PermissionType[]>>;
}

/** ✅ défauts sûrs + conformes au type AddUserInterface */
export const AddUserContext = createContext<AddUserInterface>({
  fullName: "",
  setFullName: () => {},

  username: "",
  setUsername: () => {},

  phone: "",
  setPhone: () => {},

  password: "",
  setPassword: () => {},

  isDoctor: false,
  setIsDoctor: () => {},

  clinicName: "",
  setClinicName: () => {},

  checkedRoles: [],
  setCheckedRoles: () => {},
});
