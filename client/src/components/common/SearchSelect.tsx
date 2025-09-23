import React from "react";
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi";

export type Option = {
  id: string;
  label: string;
  subLabel?: string;
  meta?: any;
};

type Props = {
  label: string;
  value: Option | null | undefined;
  onChange: (opt: Option | null) => void;
  fetchOptions: (q: string) => Promise<Option[]>;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  noResultsText?: string;
};

export default function SearchSelect({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = "Rechercher…",
  disabled,
  clearable = true,
  noResultsText = "Aucun résultat",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<Option[]>([]);
  const [highlight, setHighlight] = React.useState<number>(-1);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetchOptions(q);
        setItems(res || []);
        setHighlight(res && res.length ? 0 : -1);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q, open, fetchOptions]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const select = (opt: Option | null) => {
    onChange(opt);
    setOpen(false);
    setQ("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min((items.length ? items.length - 1 : -1), i + 1));
      listRef.current?.scrollTo({ top: (highlight + 1) * 36 });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(0, i - 1));
      listRef.current?.scrollTo({ top: Math.max(0, (highlight - 1) * 36) });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[highlight]) select(items[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={`w-full ${disabled ? "opacity-60 pointer-events-none" : ""}`} ref={boxRef}>
      <label className="text-xs font-medium mb-1 block">{label}</label>
      <div className="relative h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>

        <input
          className="h-10 w-full rounded-xl pl-9 pr-10 outline-none bg-transparent"
          placeholder={value?.label || placeholder}
          value={q}
          onChange={(e) => { setQ(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {clearable && value && (
            <button
              type="button"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-zinc-900"
              aria-label="Effacer"
              onClick={() => select(null)}
            >
              <FiX />
            </button>
          )}
          <button
            type="button"
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-zinc-900"
            aria-label="Ouvrir"
            onClick={() => setOpen((v) => !v)}
          >
            <FiChevronDown />
          </button>
        </div>

        {open && (
          <div className="absolute z-30 mt-1 left-0 right-0 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] shadow-lg">
            <div className="px-3 py-2 text-xs text-gray-500">
              {loading ? "Chargement…" : q ? `Résultats pour « ${q} »` : "Tapez pour rechercher"}
            </div>
            <div ref={listRef} className="max-h-64 overflow-auto">
              {!loading && items.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{noResultsText}</div>
              ) : (
                items.map((opt, idx) => {
                  const active = idx === highlight;
                  const selected = value?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => select(opt)}
                      className={`w-full text-left px-3 py-2 text-sm flex flex-col ${
                        active ? "bg-indigo-600/10" : "hover:bg-gray-50 dark:hover:bg-zinc-900"
                      } ${selected ? "font-medium" : ""}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.subLabel && (
                        <span className="text-[11px] text-gray-500 truncate">{opt.subLabel}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
          Sélectionné : <span className="font-medium">{value.label}</span>
        </div>
      )}
    </div>
  );
}
