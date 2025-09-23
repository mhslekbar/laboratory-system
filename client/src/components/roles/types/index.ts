export type ShowRoleType = {
  showSuccessMsg: boolean,
  setShowSuccessMsg: any,
  selectedRole: RoleType,
  setSelectedRole: any,
}

export type RoleType = {
  _id: string, 
  name: string, 
  permissions: [],
  createdAt: Date,
  updateAt: Date
}

export const DefaultRoleType:RoleType  = {
  _id: "", 
  name: "", 
  permissions: [],
  createdAt: new Date(),
  updateAt: new Date()
}

export type ArrayRoleType = {
  _id: string, 
  name: string, 
  permissions: PermissionType[],
  createdAt: Date,
  updateAt: Date
}; // Use 'RoleType' instead of 'any[]'

export const DefaultArrayRoleType:ArrayRoleType  = {
  _id: "", 
  name: "", 
  permissions: [],
  createdAt: new Date(),
  updateAt: new Date()
}

export const defaultShowRoleTypeValue: ShowRoleType = {
  showSuccessMsg: false,
  setShowSuccessMsg: () => {},
  selectedRole: DefaultRoleType,
  setSelectedRole: () => {},
}


// STart Permission and role

export const DefaultPermission:PermissionType = {
  _id: "",
  name: "",
  collectionName: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export type RoleByPermissionType = {
  _id: string,
  data: PermissionType[]
}[]

export const DefaultRoleByPermission:RoleByPermissionType = [{
  _id: "",
  data: [DefaultPermission]
}]

export type SingleRoleByPermissionType = {
  _id: string,
  data: PermissionType[]
}

export const DefaultSingleRoleByPermission:SingleRoleByPermissionType = {
  _id: "",
  data: [DefaultPermission]
}

export type PermissionType = {
  _id: string,
  name: string,
  collectionName: string,
  createdAt: string,
  updatedAt: string,
}

// End Permission ANd ROle

export type RoleDoc = {
  _id: string;
  name: string;
  permissions: any[];
  createdAt: Date;
  updateAt: Date;
};