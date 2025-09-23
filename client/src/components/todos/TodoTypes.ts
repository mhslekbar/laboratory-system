// src/components/todos/TodoTypes.ts
export type TodoStatus = "open" | "done";
export type TodoPriority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;             // YYYY-MM-DD
  priority: TodoPriority;   // low|medium|high
  tags?: string[];          // ["urgent","client"]
  status: TodoStatus;       // open|done
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}
