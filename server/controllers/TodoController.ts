// server/controllers/todoController.ts
import { Request, Response } from "express";
import Todo from "../models/TodoModel";

const parseIntOr = (v: any, d: number) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const listTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?._id || req.query.userId; // fallback si pas d'auth middleware
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { q, status = "open", page = "1", limit = "20", dateFrom, dateTo, sort = "dueAsc" } = req.query as any;

    const pageNum = parseIntOr(page, 1);
    const limitNum = parseIntOr(limit, 20);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { createdBy: userId };
    if (q) filter.$text = { $search: String(q) };
    if (status === "open") filter.done = false;
    else if (status === "done") filter.done = true;

    // Filtre par plage de dates sur dueAt (optionnel)
    if (dateFrom || dateTo) {
      filter.dueAt = {};
      if (dateFrom) filter.dueAt.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) filter.dueAt.$lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    // Tri
    const sortMap: Record<string, any> = {
      dueAsc:  { done: 1, dueAt: 1, createdAt: -1 },
      dueDesc: { done: 1, dueAt: -1, createdAt: -1 },
      createdDesc: { createdAt: -1 },
      createdAsc:  { createdAt: 1 },
      priority:    { done: 1, priority: -1, dueAt: 1 },
    };
    const sortObj = sortMap[sort] ?? sortMap.dueAsc;

    const [items, total] = await Promise.all([
      Todo.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Todo.countDocuments(filter),
    ]);

    const pages = Math.max(1, Math.ceil(total / limitNum));
    res.json({
      success: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        pages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < pages,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?._id || req.body.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, notes, dueAt, priority = "medium", assignedTo = null } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const doc = await Todo.create({
      title: String(title).trim(),
      notes: notes?.trim() || undefined,
      dueAt: dueAt ? new Date(dueAt) : null,
      priority,
      createdBy: userId,
      assignedTo: assignedTo || null,
    });

    res.json({ success: doc });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?._id || req.body.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const patch: any = {};
    const allowed = ["title", "notes", "done", "dueAt", "priority", "assignedTo"];
    for (const k of allowed) {
      if (k in req.body) patch[k] = req.body[k];
    }
    if ("title" in patch && !String(patch.title).trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    if ("dueAt" in patch) patch.dueAt = patch.dueAt ? new Date(patch.dueAt) : null;

    const doc = await Todo.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: patch },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({ success: doc });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?._id || req.query.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const doc = await Todo.findOneAndDelete({ _id: id, createdBy: userId });
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
};
