// src/components/todos/TodoItemRow.tsx
import React from "react";
import { TodoItem } from "./TodoTypes";
import { FiCalendar, FiEdit2, FiTrash2, FiCheckCircle, FiCircle } from "react-icons/fi";

const prioBadge = (p: string) =>
  p === "high" ? "bg-rose-50 text-rose-700 border-rose-200"
  : p === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
  : "bg-emerald-50 text-emerald-700 border-emerald-200";

type Props = {
  item: TodoItem;
  onToggle: (id: string) => void;
  onEdit: (item: TodoItem) => void;
  onDelete: (id: string) => void;
};

const TodoItemRow: React.FC<Props> = ({ item, onToggle, onEdit, onDelete }) => {
  const overdue = item.due ? new Date(item.due) < new Date(new Date().toDateString()) && item.status !== "done" : false;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-gray-50 transition">
      <button
        onClick={() => onToggle(item.id)}
        className={`p-2 rounded-lg border ${item.status === "done" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-gray-600 hover:bg-gray-100"}`}
        title={item.status === "done" ? "Marquer non fait" : "Marquer fait"}
      >
        {item.status === "done" ? <FiCheckCircle /> : <FiCircle />}
      </button>

      <div className="min-w-0 flex-1">
        <div className={`font-medium truncate ${item.status === "done" ? "line-through text-gray-400" : ""}`}>
          {item.title}
        </div>
        {item.notes ? (
          <div className="text-xs text-gray-500 truncate">{item.notes}</div>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs ${prioBadge(item.priority)}`}>
            Priorité: {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
          </span>

          {item.due && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${overdue ? "border-rose-200 bg-rose-50 text-rose-700" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
              <FiCalendar /> {item.due}
            </span>
          )}

          {(item.tags || []).map((t, i) => (
            <span key={i} className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">
              #{t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg hover:bg-gray-100" title="Éditer">
          <FiEdit2 />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600" title="Supprimer">
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default TodoItemRow;
