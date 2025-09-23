import React, { FormEvent, useContext, useState } from "react";
import { PermissionInterface, ShowPermissionContext } from "./types";
import { useDispatch } from "react-redux";
import { DeletePermissionApi } from "../../redux/permissions/permissionApiCalls";
import { Timeout } from "../../functions/functions";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import Modal from "./Modal";

interface DeletePermissionInterface {
  modal: boolean;
  toggle: () => void;
  PermissionData: PermissionInterface;
}

const DeletePermission: React.FC<DeletePermissionInterface> = ({ modal, toggle, PermissionData }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const { setShowSuccesMsg } = useContext(ShowPermissionContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await dispatch(DeletePermissionApi(PermissionData._id));
      if (response === true) {
        toggle();
        setErrors([]);
        setShowSuccesMsg(true);
        setTimeout(() => setShowSuccesMsg(false), Timeout);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={modal} onClose={toggle} title="Supprimer la permission" size="sm" danger>
      <form onSubmit={handleSubmit} className="space-y-3">
        <ShowErrorMsg errors={errors} setErrors={setErrors} />

        <div className="text-sm">
          <p>
            Voulez-vous vraiment supprimer
            {" "}
            <span className="font-semibold">{PermissionData?.name}</span> ?
          </p>
          <p className="mt-1 text-rose-600">Cette action est irréversible.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-white transition ${
              loading ? "bg-rose-300 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeletePermission;
