// src/routes/AuthRoute.tsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { State } from "../redux/store";
import NotAuthorized from "../pages/NotAuthorized";
import { PermissionType } from "../components/roles/types";


type Props = {
  /** Par défaut: "AFFICHER" */
  permName?: string;
  /** Exemple: "UTILISATEURS", "DOSSIERS", ... */
  collectionName: string;
  /** Élément à rendre si autorisé */
  element: React.ReactElement;
};

const AuthRoute: React.FC<Props> = ({
  permName = "AFFICHER",
  collectionName,
  element,
}) => {

  // On tolère l'absence de loading dans le slice pour compat.
  const { permissions = [], loading = false } = (useSelector(
    (s: State) => (s as any).permissions
  ) as {
    permissions: PermissionType[];
    loading?: boolean;
  }) || { permissions: [], loading: false };


  const allowed = useMemo(() => {
    const p = (permName || "").trim().toUpperCase();
    const c = (collectionName || "").trim().toUpperCase();
    return permissions?.some(
      (permission: PermissionType) =>
        (permission?.name || "").toUpperCase() === p &&
        (permission?.collectionName || "").toUpperCase() === c
    );
  }, [permissions, permName, collectionName]);

  // Éviter le "flash" NotAuthorized pendant le chargement initial
  const stillFetching = loading && permissions.length === 0;

  if (stillFetching) {
    // Peut remplacer par un spinner personnalisé si تريد
    return null;
  }

  return allowed ? element : <NotAuthorized />;
};

export default AuthRoute;
