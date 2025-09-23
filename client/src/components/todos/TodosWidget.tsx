import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { State } from "../../redux/store";
import ChartCard from "../stats/ChartCard";
import {
  addTodo,
  fetchTodos,
  toggleTodo,
  deleteTodo,
  updateTodo,
} from "../../redux/todos/todoApiCalls";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiFileText,
} from "react-icons/fi";
import TodoModal from "./TodoModal";

type Priority = "low" | "medium" | "high";
type Todo = {
  _id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueAt?: string | null;
  createdAt?: string;
  notes?: string | null;
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
};
const priorityBadge = (p: Priority) =>
  p === "high"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : p === "medium"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

const isOverdue = (t: Todo) => {
  if (!t.dueAt || t.done) return false;
  const d = new Date(t.dueAt);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return !Number.isNaN(d.getTime()) && d < today;
};

const TodosWidget: React.FC = () => {
  const dispatch: any = useDispatch();
  const { items, loading } = useSelector(
    (s: State) => (s as any).todos || { items: [], loading: false }
  );

  // Filtres
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"open" | "done" | "all">("open");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);

  // Charger depuis l'API selon filtres
  useEffect(() => {
    dispatch(fetchTodos({ status, q, sort: "priority", limit: 50 }));
  }, [dispatch, status, q]);

  const openItems: Todo[] = useMemo(
    () => (items as Todo[]).filter((t) => !t.done),
    [items]
  );
  const doneItems: Todo[] = useMemo(
    () => (items as Todo[]).filter((t) => t.done),
    [items]
  );

  const counts = useMemo(
    () => ({
      open: openItems.length,
      done: doneItems.length,
      overdue: openItems.filter(isOverdue).length,
    }),
    [openItems, doneItems]
  );

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: Todo) => {
    setEditing(t);
    setModalOpen(true);
  };

  const addOrUpdate = async (payload: {
    title: string;
    priority: Priority;
    dueAt?: string | null;
    notes?: string | null;
  }) => {
    const clean = {
      title: payload.title,
      priority: payload.priority,
      dueAt: payload.dueAt ?? undefined, // null -> undefined
      notes: payload.notes ?? undefined, // null -> undefined
    };

    if (editing) {
      await dispatch(updateTodo(editing._id, clean));
    } else {
      await dispatch(addTodo(clean));
    }
    await dispatch(fetchTodos({ status, q, sort: "priority", limit: 50 }));
  };
  return (
    <ChartCard
      title="Todo"
      subtitle="Tâches personnelles"
      right={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-9 rounded-xl border px-2 text-sm"
            >
              <option value="open">Ouvertes</option>
              <option value="done">Terminées</option>
              <option value="all">Toutes</option>
            </select>
            <input
              placeholder="Rechercher…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 rounded-xl border px-3 text-sm w-full sm:w-56"
            />
          </div>
          <button
            type="button"
            onClick={openNew}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 inline-flex items-center justify-center gap-2"
          >
            <FiPlus /> Ajouter
          </button>
        </div>
      }
    >
      {/* Bandeau compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-xs text-gray-500">Ouvertes</div>
          <div className="text-xl font-semibold">{counts.open}</div>
        </div>
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-xs text-gray-500">Terminées</div>
          <div className="text-xl font-semibold">{counts.done}</div>
        </div>
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-xs text-gray-500 inline-flex items-center gap-1">
            <FiAlertTriangle className="text-amber-500" /> En retard
          </div>
          <div className="text-xl font-semibold">{counts.overdue}</div>
        </div>
      </div>

      {/* Listes */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Ouvertes */}
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500 mb-2">
            Ouvertes ({counts.open})
          </div>
          <ul className="space-y-2">
            {openItems.map((t) => {
              const overdue = isOverdue(t);
              return (
                <li
                  key={t._id}
                  className={`rounded-xl border p-3 flex flex-col gap-2 ${
                    overdue ? "border-rose-200 bg-rose-50/40" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!t.done}
                      onChange={() => dispatch(toggleTodo(t._id, !t.done))}
                      className="h-4 w-4 mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${priorityBadge(
                            t.priority
                          )}`}
                        >
                          {PRIORITY_LABELS[t.priority]}
                        </span>
                        <span>•</span>
                        <span>
                          Échéance:{" "}
                          {t.dueAt
                            ? new Date(t.dueAt).toLocaleDateString()
                            : "—"}
                        </span>
                        {overdue && (
                          <span className="text-rose-600 font-medium">
                            • En retard
                          </span>
                        )}
                      </div>

                      {t.notes ? (
                        <div className="mt-2 text-sm text-gray-700 flex items-start gap-2">
                          <FiFileText className="mt-0.5 shrink-0 text-gray-400" />
                          <p className="line-clamp-2">{t.notes}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        className="p-2 rounded-lg border hover:bg-gray-50"
                        onClick={() => openEdit(t)}
                        title="Éditer"
                        aria-label="Éditer"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="p-2 rounded-lg border hover:bg-rose-50 text-rose-600"
                        onClick={() => dispatch(deleteTodo(t._id))}
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {!openItems.length && (
              <div className="text-sm text-gray-500">Aucune tâche ouverte</div>
            )}
          </ul>
        </div>

        {/* Terminées */}
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500 mb-2">
            Terminées ({counts.done})
          </div>
          <ul className="space-y-2">
            {doneItems.map((t) => (
              <li
                key={t._id}
                className="rounded-xl border p-3 flex items-start gap-3 bg-white opacity-75"
              >
                <input
                  type="checkbox"
                  checked={!!t.done}
                  onChange={() => dispatch(toggleTodo(t._id, !t.done))}
                  className="h-4 w-4 mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium line-through truncate">
                    {t.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${priorityBadge(
                        t.priority
                      )}`}
                    >
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                    <span>•</span>
                    <span>
                      Échéance:{" "}
                      {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  {t.notes ? (
                    <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                      <FiFileText className="mt-0.5 shrink-0 text-gray-400" />
                      <p className="line-clamp-2">{t.notes}</p>
                    </div>
                  ) : null}
                </div>
                <button
                  className="p-2 rounded-lg border hover:bg-rose-50 text-rose-600"
                  onClick={() => dispatch(deleteTodo(t._id))}
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <FiTrash2 />
                </button>
              </li>
            ))}
            {!doneItems.length && (
              <div className="text-sm text-gray-500">Aucune tâche terminée</div>
            )}
          </ul>
        </div>
      </div>

      {/* Modal */}
      <TodoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={
          editing
            ? {
                title: editing.title,
                priority: editing.priority,
                dueAt: editing.dueAt ?? undefined,
                notes: editing.notes ?? undefined,
              }
            : undefined
        }
        onSubmit={addOrUpdate}
      />

      {loading && <div className="text-xs text-gray-500 mt-3">Chargement…</div>}
    </ChartCard>
  );
};

export default TodosWidget;
