// components/measurementTypes/cible/EditStage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { State } from "../../../redux/store"; // <-- ajuste l’import si besoin
import { fetchMeasurementTypes, updateStage } from "../../../redux/measurementTypes/thunks";
import RoleCheckboxList, { Role } from "../parts/RoleCheckboxList";
import { useSelector } from "react-redux";

type Props = {
  typeId: string;
  stageId: string;    // on cible par _id
  onClose: () => void;
};

const HEX_RX = /^#?[0-9a-fA-F]{6}$/;

const EditStage: React.FC<Props> = ({ typeId, stageId, onClose }) => {
  const dispatch: any = useDispatch();

  // Rôles via useSelect
  const { roles } = useSelector((s: State) => s.roles) as unknown as { roles: Role[] };
  // Type + stage courants via useSelect (on lit la liste existante du store)
  const { items } = useSelector((s: State) => (s as any).measurementTypes);
  const type = items?.find((t: any) => String(t._id) === String(typeId));
  const stage = (type?.stages || []).find((s: any) => String(s._id) === String(stageId));

  const [name, setName] = useState(stage?.name || "");
  const [color, setColor] = useState(stage?.color || "#2563eb");
  const [order, setOrder] = useState<number>(stage?.order || 1);
  const [allowedRoles, setAllowedRoles] = useState<string[]>(
    Array.isArray(stage?.allowedRoles) ? stage!.allowedRoles : []
  );

  const [loading, setLoading] = useState(false);
  const [hexValid, setHexValid] = useState(true);

  const nameRef = useRef<HTMLInputElement>(null);
  const hexRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(stage?.name || "");
    setColor(stage?.color || "#2563eb");
    setOrder(stage?.order || 1);
    setAllowedRoles(Array.isArray(stage?.allowedRoles) ? stage!.allowedRoles : []);
    setHexValid(!stage?.color || HEX_RX.test(stage?.color || ""));
  }, [stage]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  if (!stage) return null;

  const normalizeHex = (val: string) => {
    if (!val) return "";
    const v = val.startsWith("#") ? val : `#${val}`;
    return v.toUpperCase();
    };

  const onHexInput = (val: string) => {
    setColor(val);
    setHexValid(!val || HEX_RX.test(val));
  };

  const onSave = async () => {
    if (!name.trim()) {
      alert("‘nom’ est obligatoire.");
      nameRef.current?.focus();
      return;
    }
    if (color && !HEX_RX.test(color)) {
      alert("Couleur invalide. Utilisez un hex de type #RRGGBB.");
      hexRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const ok = await dispatch(
        updateStage(typeId, stageId, {
          name: name.trim(),
          color: color ? normalizeHex(color) : undefined,
          order: order || 1,
          allowedRoles: Array.from(new Set(allowedRoles)),
        })
      );
      if (ok) {
        await dispatch(fetchMeasurementTypes());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3" onKeyDown={onKeyDown}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
          <h2 className="text-lg font-semibold">Éditer l’étape</h2>
          <p className="text-xs opacity-90">Modifiez le nom, la couleur, l’ordre et les rôles autorisés.</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Ligne 1 : Nom / Ordre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">
                Nom <span className="text-rose-600">*</span>
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Libellé de l’étape"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Ordre</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 1)}
                className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1, 2, 3…"
              />
              <p className="mt-1 text-[11px] text-gray-500">Détermine la position (1 = en premier).</p>
            </div>
          </div>

          {/* Ligne 2 : Couleur + Rôles (checkbox) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Couleur</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={HEX_RX.test(color) ? (color.startsWith("#") ? color : `#${color}`) : "#2563EB"}
                  onChange={(e) => onHexInput(e.target.value)}
                  className="h-11 w-16 rounded border"
                  aria-label="Sélecteur de couleur"
                />
                <input
                  ref={hexRef}
                  value={color}
                  onChange={(e) => onHexInput(e.target.value)}
                  className={`h-11 rounded-xl border px-3 font-mono outline-none focus:ring-2 ${
                    hexValid ? "focus:ring-indigo-500" : "focus:ring-rose-500 border-rose-400"
                  }`}
                  placeholder="#RRGGBB"
                />
                <span className="inline-block h-5 w-5 rounded-full border" style={{ background: HEX_RX.test(color) ? (color.startsWith("#") ? color : `#${color}`) : "#cbd5e1" }} />
              </div>
              {!hexValid && <p className="mt-1 text-[11px] text-rose-600">Format invalide. Exemple: <code>#1E90FF</code></p>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Rôles autorisés</label>
              <RoleCheckboxList
                roles={roles || []}
                value={allowedRoles}
                onChange={setAllowedRoles}
                namePrefix="editstage-role"
              />
              <p className="mt-1 text-[11px] text-gray-500">Vide = aucune restriction de rôle.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={loading || !name.trim() || !hexValid}
            className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
            title={!hexValid ? "Couleur invalide (#RRGGBB)" : ""}
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStage;
