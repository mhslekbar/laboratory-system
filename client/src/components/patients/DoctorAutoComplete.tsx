// src/components/patients/DoctorAutoComplete.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchDoctors } from "../../redux/users/UserApiCalls";

type Doctor = { _id: string; fullName?: string; username?: string };
type DoctorsMeta = {
  items: Doctor[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Props = {
  value?: string; // doctorId sélectionné
  onChange: (doctorId: string | "") => void;
  placeholder?: string; // ex: "Rechercher un médecin…"
  className?: string;
};

const useDebounced = (val: string, delay = 350) => {
  const [v, setV] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setV(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return v;
};

const DoctorAutoComplete: React.FC<Props> = ({
  value = "",
  onChange,
  placeholder = "Rechercher un médecin…",
  className,
}) => {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 350);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<DoctorsMeta>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false,
  });
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger liste initiale
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchDoctors({ q: "", limit: 20 });
        if (mounted) setMeta(res);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Recherche côté serveur (debounced)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchDoctors({ q: debounced, limit: 20, page: 1 });
        if (mounted) {
          setMeta(res);
          setHighlight(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [debounced]);

  // Fermer au clic extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const selectedLabel = useMemo(() => {
    const found = meta.items.find((d) => d._id === value);
    return found?.fullName || found?.username || "";
  }, [meta.items, value]);

  // const items = meta.items;
  const items = meta.items;
  const listboxId = "doctor-autocomplete-list";
  const activeOptionId =
    open && items[highlight]?._id
      ? `doctor-opt-${items[highlight]!._id}`
      : undefined;
  const showNoResult = !loading && items.length === 0;

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    // on garde la query lisible si on a trouvé un label
    const found = items.find((i) => i._id === id);
    if (found) setQuery(found.fullName || found.username || "");
  };

  const clear = () => {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) setOpen(true);
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlight];
      if (item) pick(item._id);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className || ""}`} ref={boxRef}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-10 w-72 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          placeholder={placeholder}
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="h-10 px-3 rounded-lg border text-sm hover:bg-gray-50"
          >
            Tous les médecins
          </button>
        ) : null}
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-[22rem] max-h-64 overflow-auto rounded-lg border bg-white shadow"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Chargement…</div>
          )}
          {showNoResult && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Aucun résultat
            </div>
          )}
          {items.map((d, idx) => {
            const label = d.fullName || d.username || d._id;
            const active = idx === highlight;
            return (
              <div
                key={d._id}
                id={`doctor-opt-${d._id}`}
                role="option"
                aria-selected={value === d._id}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(d._id);
                }}
                className={`px-3 py-2 cursor-pointer ${
                  active ? "bg-indigo-50" : ""
                }`}
              >
                <div className="text-sm font-medium">{label}</div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLabel && !query && (
        <div className="mt-1 text-xs text-gray-500">
          Sélectionné : {selectedLabel}
        </div>
      )}
    </div>
  );
};

export default DoctorAutoComplete;
