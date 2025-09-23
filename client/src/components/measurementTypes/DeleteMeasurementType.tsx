import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteMeasurementType, fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";

type Props = {
  open: boolean;
  onClose: () => void;
  id?: string;
  name?: string;
};

const DeleteMeasurementType: React.FC<Props> = ({ open, onClose, id, name }) => {
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(false);
  if (!open || !id) return null;

  const onConfirm = async () => {
    try {
      setLoading(true);
      const ok = await dispatch(deleteMeasurementType(id));
      if (ok) {
        await dispatch(fetchMeasurementTypes());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white">
          <h2 className="text-lg font-semibold">Supprimer le type</h2>
        </div>
        <div className="p-5 text-sm">
          Voulez-vous vraiment supprimer <span className="font-semibold">{name || "ce type"}</span> ?
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} disabled={loading} className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60">
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMeasurementType;
