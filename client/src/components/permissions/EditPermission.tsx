import React, { FormEvent, useContext, useState } from "react";
import { DataPermissionContext, PermissionInterface, ShowPermissionContext } from "./types";
import InputsPermission from "./forms/InputsPermission";
import { useDispatch } from "react-redux";
import { EditPermissionApi } from "../../redux/permissions/permissionApiCalls";
import { Timeout } from "../../functions/functions";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import Modal from "./Modal";

interface EditPermissionInterface {
  modal: boolean;
  toggle: () => void;
  PermissionData: PermissionInterface;
}

const EditPermission: React.FC<EditPermissionInterface> = ({ modal, toggle, PermissionData }) => {
  const [name, setName] = useState(PermissionData.name);
  const [collectionName, setCollectionName] = useState(PermissionData.collectionName);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const { setShowSuccesMsg } = useContext(ShowPermissionContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await dispatch(EditPermissionApi(PermissionData._id, { name, collectionName }));
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
    <DataPermissionContext.Provider value={{ name, setName, collectionName, setCollectionName }}>
      <Modal
        open={modal}
        onClose={toggle}
        title="Modifier la permission"
        size="sm"
        initialFocusId="perm-edit-name-input"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
          <InputsPermission idPrefix="perm-edit" />
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !name.trim() ||
                !collectionName.trim() ||
                (name === PermissionData.name && collectionName === PermissionData.collectionName)
              }
              className={`rounded-lg px-4 py-2 text-white transition ${
                loading ||
                !name.trim() ||
                !collectionName.trim() ||
                (name === PermissionData.name && collectionName === PermissionData.collectionName)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Enregistrement…" : "Modifier"}
            </button>
          </div>
        </form>
      </Modal>
    </DataPermissionContext.Provider>
  );
};

export default EditPermission;
