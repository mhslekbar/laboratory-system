import React, { useMemo, useState } from "react";
import AddPermission from "./AddPermission";
import { DefaultPermissionInterface, PermissionInterface, ShowPermissionContext } from "./types";
import SuccessMsg from "../../Messages/SuccessMsg";
import DataPermissions from "./DataPermissions";
import DeletePermission from "./DeletePermission";
import EditPermission from "./EditPermission";
import { FaSearch } from "react-icons/fa";
import BulkCreatePermissions from "./BulkCreatePermissions";
import DeleteAllPermissions from "./DeleteAllPermissions";

const ShowPermissions: React.FC = () => {
  const [showSuccesMsg, setShowSuccesMsg] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionInterface>(DefaultPermissionInterface);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [q, setQ] = useState("");

  // we'll pass search term down to filter in DataPermissions
  const search = useMemo(() => q.trim().toLowerCase(), [q]);

  return (
    <ShowPermissionContext.Provider
      value={{
        showSuccesMsg,
        setShowSuccesMsg,
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        selectedPermission,
        setSelectedPermission,
      }}
    >
      {showSuccesMsg && (
        <SuccessMsg modal={showSuccesMsg} toggle={() => setShowSuccesMsg(!showSuccesMsg)} />
      )}

      {/* Header: search + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une permission"
            className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <AddPermission />
        <BulkCreatePermissions />
        <DeleteAllPermissions />
      </div>

      {/* List */}
      <DataPermissions search={search} />

      {/* Modals */}
      {showDeleteModal && selectedPermission && (
        <DeletePermission
          PermissionData={selectedPermission}
          modal={showDeleteModal}
          toggle={() => setShowDeleteModal(!showDeleteModal)}
        />
      )}
      {showEditModal && selectedPermission && (
        <EditPermission
          PermissionData={selectedPermission}
          modal={showEditModal}
          toggle={() => setShowEditModal(!showEditModal)}
        />
      )}
    </ShowPermissionContext.Provider>
  );
};

export default ShowPermissions;
