import React, { FormEvent, useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { DataPermissionContext, ShowPermissionContext } from "./types";
import InputsPermission from "./forms/InputsPermission";
import { useDispatch } from "react-redux";
import { AddPermissionApi } from "../../redux/permissions/permissionApiCalls";
import { Timeout } from "../../functions/functions";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import Modal from "./Modal";

const AddPermission: React.FC = () => {
  const [name, setName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const { setShowSuccesMsg } = useContext(ShowPermissionContext);

  const toggle = () => setModal((s) => !s);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await dispatch(AddPermissionApi({ name, collectionName }));
      if (response === true) {
        toggle();
        setName("");
        setCollectionName("");
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
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          onClick={toggle}
        >
          <span className="inline-flex items-center gap-2">
            <FaPlus />
            Ajouter
          </span>
        </button>
      </div>

      <Modal
        open={modal}
        onClose={toggle}
        title="Ajouter une permission"
        size="sm"
        initialFocusId="perm-name-input"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
          <InputsPermission />
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !collectionName.trim()}
              className={`rounded-lg px-4 py-2 text-white transition ${
                loading || !name.trim() || !collectionName.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>
    </DataPermissionContext.Provider>
  );
};

export default AddPermission;
