import React, { useContext, useEffect, useState } from "react";
import { UserInterface } from "./types";
import { ShowUserContext } from "./ShowUsers";
import { Timeout } from "../../functions/functions";
import { DeleteUserApi } from "../../redux/users/UserApiCalls";
import { bindActionCreators } from "redux";
import { useDispatch } from "react-redux";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";

interface DeleteUserInterface {
  modal: boolean;
  toggle: () => void;
  user: UserInterface;
}

const DeleteUser: React.FC<DeleteUserInterface> = ({ modal, toggle, user }) => {
  const { setSuccessMsg } = useContext(ShowUserContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const displayName = user?.fullName || (user as any)?.name || user?.username || "";

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && toggle();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, loading, toggle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrors([]);
    try {
      const bound = bindActionCreators({ DeleteUserApi }, dispatch as any);
      const response = await bound.DeleteUserApi(user._id as string);
      if (typeof response === "boolean") {
        setSuccessMsg(true);
        toggle();
        setTimeout(() => setSuccessMsg(false), Timeout);
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3" role="dialog" aria-modal="true" onClick={() => !loading && toggle()}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white">
          <h2 className="text-lg font-semibold">Supprimer l’utilisateur</h2>
          <p className="text-xs opacity-90">Action irréversible.</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir supprimer <b className="font-semibold">{displayName}</b> ?
          </p>
          <p className="text-xs text-gray-500">Cette action est définitive.</p>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={toggle} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={loading} className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60">
                {loading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;
