// components/measurementTypes/cible/AddStage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addStage, fetchMeasurementTypes } from "../../../redux/measurementTypes/thunks";

type Props = {
  typeId: string;
  onClose: () => void;
};

const AddStage: React.FC<Props> = ({ typeId, onClose }) => {
  const dispatch: any = useDispatch();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [order, setOrder] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus sur le premier champ à l’ouverture
    keyRef.current?.focus();
  }, []);

  const onSave = async () => {
    if (!key.trim() || !name.trim()) return alert("‘clé’ et ‘nom’ sont obligatoires.");
    try {
      setLoading(true);
      const ok = await dispatch(addStage(typeId, { key: key.trim(), name: name.trim(), color, order }));
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
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
          <h2 className="text-lg font-semibold">Ajouter une étape</h2>
          <p className="text-xs opacity-90">Renseignez la clé, le nom, la couleur et l’ordre (optionnel).</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Ligne 1 : Clé / Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Clé <span className="text-rose-600">*</span></label>
              <input
                ref={keyRef}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ex: design / drill…"
              />
              <p className="mt-1 text-[11px] text-gray-500">Identifiant unique (sans espaces).</p>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Nom <span className="text-rose-600">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Libellé de l’étape"
              />
            </div>
          </div>

          {/* Ligne 2 : Couleur / Ordre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Couleur</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 w-16 rounded border"
                  aria-label="Sélecteur de couleur"
                />
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 rounded-xl border px-3 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="#RRGGBB"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Choisissez une couleur ou collez un hex (ex: #1E90FF).</p>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Ordre (optionnel)</label>
              <input
                type="number"
                min={1}
                value={order ?? ""}
                onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : undefined)}
                className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="1, 2, 3…"
              />
              <p className="mt-1 text-[11px] text-gray-500">Laissez vide pour ajouter à la suite automatiquement.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
          <button
            onClick={onSave}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Ajout…" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStage;
