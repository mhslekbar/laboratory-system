import React, { useContext, useState } from "react";
import Modal from "./Modal";
import { FaTrash } from "react-icons/fa";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { useDispatch } from "react-redux";
import { DeleteAllPermissionsApi } from "../../redux/permissions/permissionApiCalls";
import { ShowPermissionContext } from "./types";
import { Timeout } from "../../functions/functions";

const DeleteAllPermissions: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const { setShowSuccesMsg } = useContext(ShowPermissionContext);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE" && !loading;

  const onDeleteAll = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await dispatch(DeleteAllPermissionsApi());
      if (resp === true) {
        setOpen(false);
        setConfirmText("");
        setShowSuccesMsg(true);
        setTimeout(() => setShowSuccesMsg(false), Timeout);
      } else if (Array.isArray(resp)) {
        setErrors(resp);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <FaTrash />
          Tout supprimer
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer toutes les permissions" size="md" danger>
        <div className="space-y-3">
          <ShowErrorMsg errors={errors} setErrors={setErrors as any} />

          <p className="text-sm">
            Cette action supprimera <strong>toutes</strong> les permissions de la base de données.
            <br />
            Pour confirmer, tapez <code className="px-1 py-0.5 bg-rose-100 rounded">DELETE</code> :
          </p>

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-xl border p-2 outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="DELETE"
          />

          <div className="flex items-center justify-end gap-3">
            <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button
              type="button"
              disabled={!canDelete}
              onClick={onDeleteAll}
              className={`rounded-lg px-4 py-2 text-white transition ${
                canDelete ? "bg-rose-600 hover:bg-rose-700" : "bg-rose-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Suppression…" : "Supprimer tout"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeleteAllPermissions;
