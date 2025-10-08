// components/measurementTypes/forms/InputsMeasurementTypes.tsx
import React from "react";
import { MeasurementTypeDto } from "../types";

type Props = {
  editing: MeasurementTypeDto;
  setEditing: (val: MeasurementTypeDto) => void;
  disabledKey?: boolean;
};

const InputsMeasurementTypes: React.FC<Props> = ({ editing, setEditing, disabledKey }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Clé (unique)</label>
        <input
          value={editing.key}
          disabled={!!disabledKey}
          onChange={(e) => setEditing({ ...editing, key: e.target.value })}
          className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          placeholder="Ex: TYPE1"
        />
        <p className="mt-1 text-[11px] text-gray-500">Utilisée comme identifiant technique.</p>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Nom (FR/AR)</label>
        <input
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Libellé lisible par l'utilisateur"
        />
      </div>
    </div>
  );
};

export default InputsMeasurementTypes;
