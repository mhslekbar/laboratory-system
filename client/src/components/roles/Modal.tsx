import React, { useEffect, useRef } from "react";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: ModalSize;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** If true, shows a subtle danger accent in header (useful for delete) */
  danger?: boolean;
  /** Pass an id of an element to focus when the modal opens */
  initialFocusId?: string;
}

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
  danger,
  initialFocusId,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Auto focus
  useEffect(() => {
    if (!open) return;
    const el = initialFocusId ? document.getElementById(initialFocusId) : panelRef.current;
    el?.focus?.();
  }, [open, initialFocusId]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    // click outside panel closes
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={handleBackdrop}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${sizeClass[size]} mx-auto bg-white rounded-2xl shadow-xl ring-1 ring-black/5
                    animate-[fadeIn_180ms_ease-out]`}
        style={{ animationFillMode: "both" }}
      >
        {/* Header */}
        <div className={`px-5 pt-4 pb-3 border-b rounded-t-2xl ${danger ? "bg-rose-50" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="modal-title" className={`text-lg font-semibold ${danger ? "text-rose-700" : "text-gray-900"}`}>
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="rounded-lg p-2 hover:bg-gray-100"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-70">
                <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29l-1.41 1.42L10.59 13.4L4.3 19.71L2.89 18.3L9.17 12L2.89 5.71L4.3 4.29l6.29 6.3l6.29-6.3z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 pt-3 border-t rounded-b-2xl bg-gray-50">
            <div className="flex items-center justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>

      {/* keyframes (scoped via inline style for simplicity) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
