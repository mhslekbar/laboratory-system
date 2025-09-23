import React, { useContext, useMemo, useState } from "react";
import Modal from "./Modal";
import { FaFileImport } from "react-icons/fa";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { useDispatch } from "react-redux";
import { AddManyPermissionsApi } from "../../redux/permissions/permissionApiCalls";
import { ShowPermissionContext } from "./types";
import { Timeout } from "../../functions/functions";

type Row = { name: string; collectionName: string; line: number };

const parseLines = (raw: string): { valid: Row[]; invalid: { line: number; raw: string }[] } => {
  const lines = raw.split(/\r?\n/);
  const valid: Row[] = [];
  const invalid: { line: number; raw: string }[] = [];

  lines.forEach((l, i) => {
    const line = l.trim();
    if (!line) return;

    // split by comma, colon, or tab
    const parts = line.split(/[,\t:]/).map((s) => s.trim()).filter(Boolean);

    let name = "";
    let collectionName = "";

    if (parts.length === 2) {
      // Heuristic: if one part contains dot/verb-ish, assume it's name first
      const [a, b] = parts;
      // Try both orders safely – prefer (name, collectionName) if name has dot or colon-like perms
      const looksLikeName = /\./.test(a) || /read|write|create|edit|delete|list|view/i.test(a);
      if (looksLikeName) {
        name = a;
        collectionName = b;
      } else {
        // fallback: if b looks like action, maybe swap
        const bLooksLikeName = /\./.test(b) || /read|write|create|edit|delete|list|view/i.test(b);
        if (bLooksLikeName) {
          name = b;
          collectionName = a;
        } else {
          // default to (name, collection)
          name = a;
          collectionName = b;
        }
      }
    } else if (parts.length > 2) {
      // too many parts – attempt first two
      name = parts[0];
      collectionName = parts[1];
    }

    name = String(name || "").trim();
    collectionName = String(collectionName || "").trim();

    if (name && collectionName) valid.push({ name, collectionName, line: i + 1 });
    else invalid.push({ line: i + 1, raw: l });
  });

  return { valid, invalid };
};

const BulkCreatePermissions: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch: any = useDispatch();
  const { setShowSuccesMsg } = useContext(ShowPermissionContext);

  const { valid, invalid } = useMemo(() => parseLines(raw), [raw]);

  // dedupe by (name, collectionName)
  const preview = useMemo(() => {
    const seen = new Set<string>();
    const rows: Row[] = [];
    for (const r of valid) {
      const key = `${r.name}__${r.collectionName}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(r);
      }
    }
    return rows;
  }, [valid]);

  const hasSomething = preview.length > 0;
  const canSubmit = hasSomething && errors.length === 0 && !loading;

  const onImport = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const payload = preview.map(({ name, collectionName }) => ({ name, collectionName }));
      const resp = await dispatch(AddManyPermissionsApi(payload));
      if (resp === true) {
        setOpen(false);
        setRaw("");
        setShowSuccesMsg(true);
        setTimeout(() => setShowSuccesMsg(false), Timeout);
      } else if (Array.isArray(resp)) {
        setErrors(resp);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <FaFileImport />
          Importer
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Importer des permissions (coller la liste)"
        size="lg"
        initialFocusId="bulk-perms-textarea"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Format supporté par ligne: <code>name,collectionName</code> — ex:
            <code className="ml-2">user.read,users</code>. Les séparateurs acceptés: virgule, deux-points, tabulation.
          </p>

          <textarea
            id="bulk-perms-textarea"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            placeholder={"Exemples:\nuser.read,users\nuser.create,users\ninvoice.delete,invoices"}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <ShowErrorMsg errors={errors} setErrors={setErrors as any} />

          {/* Preview */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b text-sm text-gray-600 flex items-center justify-between">
              <span>Prévisualisation</span>
              <span>
                Valides: <strong>{preview.length}</strong>
                {invalid.length ? (
                  <span className="ml-3 text-rose-600">
                    Invalides: <strong>{invalid.length}</strong>
                  </span>
                ) : null}
              </span>
            </div>

            {preview.length ? (
              <div className="max-h-64 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, idx) => (
                      <tr key={`${r.name}-${r.collectionName}-${idx}`} className="border-t">
                        <td className="px-3 py-2 w-12 text-gray-500">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2">{r.collectionName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">Rien à prévisualiser.</div>
            )}

            {invalid.length ? (
              <div className="px-4 py-2 border-t bg-rose-50 text-rose-700 text-xs">
                Lignes invalides: {invalid.map((x) => x.line).join(", ")}
              </div>
            ) : null}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg px-4 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onImport}
              className={`rounded-lg px-4 py-2 text-white transition ${
                canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Importation…" : "Importer"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkCreatePermissions;
