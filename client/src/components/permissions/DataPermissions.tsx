import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { State } from "../../redux/store";
import { ShowPermissionApi } from "../../redux/permissions/permissionApiCalls";
import { MdRemoveCircle } from "react-icons/md";
import { PermissionInterface, ShowPermissionContext } from "./types";
import { FaEdit, FaMinus, FaPlus } from "react-icons/fa";

interface Props {
  search?: string; // lowercased query from parent
}

const DataPermissions: React.FC<Props> = ({ search = "" }) => {
  const { permissions } = useSelector((state: State) => state.permissions);
  const dispatch: any = useDispatch();

  useEffect(() => {
    dispatch(ShowPermissionApi());
  }, [dispatch]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return permissions || [];
    const q = search;
    return (permissions || []).filter(
      (p: any) =>
        p?.name?.toLowerCase()?.includes(q) ||
        p?.collectionName?.toLowerCase()?.includes(q)
    );
  }, [permissions, search]);

  // Group by collectionName
  const grouped: Record<string, PermissionInterface[]> = useMemo(() => {
    return (filtered || []).reduce((acc: Record<string, PermissionInterface[]>, item: PermissionInterface) => {
      const key = item.collectionName || "Autres";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  // Accordion open state per group
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggleGroup = (group: string) =>
    setOpen((prev) => ({ ...prev, [group]: !prev[group] }));

  const { showEditModal, setShowEditModal, showDeleteModal, setShowDeleteModal, setSelectedPermission } =
    useContext(ShowPermissionContext);

  const onDelete = (permission: PermissionInterface) => {
    setSelectedPermission(permission);
    setShowDeleteModal(!showDeleteModal);
  };
  const onEdit = (permission: PermissionInterface) => {
    setSelectedPermission(permission);
    setShowEditModal(!showEditModal);
  };

  const entries = useMemo(() => Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)), [grouped]);

  if (!entries.length) {
    return (
      <div className="mt-4">
        <div className="rounded-2xl border bg-white shadow-sm p-6 text-center text-sm text-gray-500">
          Aucune permission trouvée.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {entries.map(([group, list]) => {
        const isOpen = !!open[group];
        return (
          <section key={group} className="rounded-2xl border bg-white shadow-sm">
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="rounded-lg p-2 hover:bg-gray-100"
                  onClick={() => toggleGroup(group)}
                  aria-expanded={isOpen}
                >
                  {isOpen ? <FaMinus className="text-indigo-600" /> : <FaPlus className="text-indigo-600" />}
                </button>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{group}</div>
                  <div className="text-xs text-gray-500">{list.length} permissions</div>
                </div>
              </div>
            </div>

            {/* Group body */}
            <div className={`${isOpen ? "block" : "hidden"} px-4 py-3`}>
              <ul className="space-y-2">
                {list
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((perm) => (
                    <li
                      key={perm._id}
                      className="flex items-center justify-between rounded-xl border bg-gray-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{perm.name}</div>
                        <div className="text-xs text-gray-500">{perm.collectionName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg p-2 hover:bg-blue-50 text-blue-600"
                          onClick={() => onEdit(perm)}
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          <FaEdit style={{ fontSize: 18 }} />
                        </button>
                        <button
                          className="rounded-lg p-2 hover:bg-rose-50 text-rose-600"
                          onClick={() => onDelete(perm)}
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <MdRemoveCircle style={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default DataPermissions;
