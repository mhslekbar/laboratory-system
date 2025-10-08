// components/measurementTypes/parts/RoleCheckboxList.tsx
import React from "react";

export type Role = { _id: string; name: string };

type Props = {
  roles: Role[];
  value: string[];                       // selected role ids
  onChange: (next: string[]) => void;    // called with updated selection
  namePrefix?: string;                   // optional html name prefix (for ids)
};

const RoleCheckboxList: React.FC<Props> = ({ roles, value, onChange, namePrefix = "role" }) => {
  const selected = new Set(value || []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  if (!roles?.length) {
    return <div className="text-xs text-gray-500">Aucun rôle disponible</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {roles.map((r) => {
        const id = `${namePrefix}-${r._id}`;
        const checked = selected.has(r._id);
        return (
          <label key={r._id} htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              id={id}
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={checked}
              onChange={() => toggle(r._id)}
            />
            <span>{r.name}</span>
          </label>
        );
      })}
    </div>
  );
};

export default RoleCheckboxList;
