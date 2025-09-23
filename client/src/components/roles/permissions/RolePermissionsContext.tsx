// permissions/RolePermissionsContext.tsx
import React from "react";

export type RolePermissionsCtx = {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const RolePermissionsContext = React.createContext<RolePermissionsCtx>({
  selectedIds: new Set(),
  setSelectedIds: () => {},
});
