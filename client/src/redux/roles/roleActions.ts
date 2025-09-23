export enum RoleType {
  SHOW_ROLES = "SHOW_ROLES",
  ADD_ROLE = "ADD_ROLE",
  EDIT_ROLE = "EDIT_ROLE",
  DELETE_ROLE = "DELETE_ROLE",
  CLEAR_ROLE = "CLEAR_ROLE",
}

export enum RoleStatus {
  START = "START",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}

interface ShowRolesAction {
  type: { name: string, method: RoleType.SHOW_ROLES },
  status: string,
  payload?: string[]
}

interface AddRoleAction {
  type: { name: string, method: RoleType.ADD_ROLE },
  status: string,
  payload?: string[]
}

interface EditRoleAction {
  type: { name: string, method: RoleType.EDIT_ROLE },
  status: string,
  payload?: string[]
}

interface DeleteRoleAction {
  type: { name: string, method: RoleType.DELETE_ROLE },
  status: string,
  payload?: string[]
}

export type RoleAction = ShowRolesAction | AddRoleAction | EditRoleAction | DeleteRoleAction