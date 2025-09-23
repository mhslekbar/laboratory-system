// src/HtmlComponents/ImageUploader.tsx
import React, { useRef, useState } from "react";

type Props = {
  label: string;
  // Shown in the preview box (should be absolute for <img>)
  currentUrl?: string;
  // Called after successful upload; pass back the URL from API (often absolute)
  onUploaded: (url: string) => void;
  // Backend folder (?folder=logos / favicons)
  folder?: string;
  // The actual upload function you already have in your apiCalls
  uploadFn: (file: File, folder?: string) => Promise<string>;
  // MIME whitelist
  accept?: string;
  // Optional help text under the control
  hint?: string;
  // Max size in MB
  maxMB?: number;
};

const ImageUploader: React.FC<Props> = ({
  label,
  currentUrl,
  onUploaded,
  folder = "general",
  uploadFn,
  accept = "image/*",
  hint,
  maxMB = 5,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");

  const pick = () => inputRef.current?.click();

  const validate = (file: File) => {
    setError("");
    const sizeOK = file.size <= maxMB * 1024 * 1024;
    if (!sizeOK) {
      setError(`Fichier trop volumineux (max ${maxMB} Mo).`);
      return false;
    }
    // Basic MIME filter using accept list
    if (accept && accept !== "*/*") {
      const accepted = accept.split(",").map((x) => x.trim());
      const ok = accepted.some((a) => {
        if (a.endsWith("/*")) {
          const base = a.slice(0, -2);
          return file.type.startsWith(base + "/");
        }
        return file.type === a;
      });
      if (!ok) {
        setError("Type de fichier non supporté.");
        return false;
      }
    }
    return true;
  };

  const doUpload = async (file: File) => {
    if (!validate(file)) return;
    setUploading(true);
    try {
      const url = await uploadFn(file, folder);
      onUploaded(url);
    } catch (e) {
      console.error(e);
      setError("Échec de l’upload. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void doUpload(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void doUpload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`flex gap-3 items-center rounded-xl border p-3 bg-white transition
          ${dragActive ? "ring-2 ring-indigo-500" : "hover:shadow"} cursor-pointer`}
      >
        <div className="w-16 h-16 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center">
          {currentUrl ? (
            <img src={currentUrl} alt="preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">Aperçu</span>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm">
            <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white mr-2">
              {uploading ? "Envoi…" : "Choisir / Déposer"}
            </span>
            <span className="text-gray-600">Formats: {accept || "image/*"} — max {maxMB} Mo</span>
          </div>
          {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
};

export default ImageUploader;
