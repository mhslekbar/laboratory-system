// src/components/stats/utils.ts
export type DeliveryStatus = "pending" | "ready" | "completed";
export type PeriodMode = "monthly" | "yearly" | "range";

export type CaseItem = {
  _id?: string;
  id?: string;
  createdAt?: string | Date;
  delivery?: { status?: DeliveryStatus | string | null };
  caseApproval?: { approved?: boolean | null };
  doctor?: string | { _id?: string };
  patient?: string | { _id?: string };
};

export type UserLike = { _id?: string; doctor?: { isDoctor?: boolean } | null; fullName?: string; username?: string };
export type PatientLike = { _id?: string; name?: string };

export const toYMD = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const safeId = (v: any): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v;
  return v._id ?? null;
};

export const normalizeStatus = (s?: string | null): DeliveryStatus => {
  if (s === "ready") return "ready";
  if (SAME(s, "completed")) return "completed";
  return "pending";
};

const SAME = (a?: string | null, b?: string) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase();

export const isWithinRange = (date?: string | Date, from?: string, to?: string) => {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return false;

  const fromD = from ? startOfDay(new Date(from)) : null;
  const toD = to ? endOfDay(new Date(to)) : null;

  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
};

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const yearKey = (d: Date) => `${d.getFullYear()}`;

export const monthsBetween = (from: Date, to: Date) => {
  const res: string[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    res.push(monthKey(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return res;
};

export const yearsBetween = (from: Date, to: Date) => {
  const res: string[] = [];
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) res.push(String(y));
  return res;
};

export const aggregateCasesByMonth = (cases: CaseItem[], from: string, to: string) => {
  const fromD = startOfDay(new Date(from));
  const toD = endOfDay(new Date(to));
  const buckets = monthsBetween(fromD, toD).reduce((acc, k) => {
    acc[k] = { pending: 0, ready: 0, completed: 0, received: 0 };
    return acc;
  }, {} as Record<string, { pending: number; ready: number; completed: number; received: number }>);

  for (const c of cases) {
    if (!isWithinRange(c.createdAt!, from, to)) continue;
    const d = new Date(c.createdAt!);
    const k = monthKey(d);
    if (!buckets[k]) continue;
    const st = normalizeStatus(c.delivery?.status as any);
    buckets[k][st] += 1;
    if (c.caseApproval?.approved) buckets[k].received += 1;
  }

  return Object.entries(buckets).map(([k, v]) => ({
    period: k,
    ...v,
    totalStatus: v.pending + v.ready + v.completed,
    totalInclReceived: v.pending + v.ready + v.completed + v.received,
  }));
};

export const aggregateCasesByYear = (cases: CaseItem[], from: string, to: string) => {
  const fromD = startOfDay(new Date(from));
  const toD = endOfDay(new Date(to));
  const buckets = yearsBetween(fromD, toD).reduce((acc, k) => {
    acc[k] = { pending: 0, ready: 0, completed: 0, received: 0 };
    return acc;
  }, {} as Record<string, { pending: number; ready: number; completed: number; received: number }>);

  for (const c of cases) {
    if (!isWithinRange(c.createdAt!, from, to)) continue;
    const d = new Date(c.createdAt!);
    const k = yearKey(d);
    if (!buckets[k]) continue;
    const st = normalizeStatus(c.delivery?.status as any);
    buckets[k][st] += 1;
    if (c.caseApproval?.approved) buckets[k].received += 1;
  }

  return Object.entries(buckets).map(([k, v]) => ({
    period: k,
    ...v,
    totalStatus: v.pending + v.ready + v.completed,
    totalInclReceived: v.pending + v.ready + v.completed + v.received,
  }));
};

export const kpisForRange = (cases: CaseItem[], from: string, to: string) => {
  let total = 0, pending = 0, ready = 0, completed = 0, received = 0;
  for (const c of cases) {
    if (!isWithinRange(c.createdAt!, from, to)) continue;
    total++;
    const st = normalizeStatus(c.delivery?.status as any);
    if (st === "pending") pending++;
    else if (st === "ready") ready++;
    else completed++;
    if (c.caseApproval?.approved) received++;
  }
  return { total, pending, ready, completed, received };
};

export const topDoctors = (cases: CaseItem[], users: UserLike[], n = 10, from?: string, to?: string) => {
  const docs = new Map<string, { name: string; pending: number; received: number; total: number }>();
  const isIn = (c: CaseItem) => (from || to) ? isWithinRange(c.createdAt!, from, to) : true;

  const nameOf = (u?: UserLike | null) => (u?.fullName || u?.username || "—");

  for (const c of cases) {
    if (!isIn(c)) continue;
    const did = safeId(c.doctor);
    if (!did) continue;
    const u = users.find(x => safeId(x) === did);
    if (!u || !(u.doctor?.isDoctor)) continue;

    const key = did;
    if (!docs.has(key)) docs.set(key, { name: nameOf(u), pending: 0, received: 0, total: 0 });

    const bucket = docs.get(key)!;
    bucket.total++;
    const st = normalizeStatus(c.delivery?.status as any);
    if (st === "pending") bucket.pending++;
    if (c.caseApproval?.approved) bucket.received++;
  }

  return Array.from(docs.values())
    .sort((a, b) => b.received - a.received || b.total - a.total)
    .slice(0, n);
};

export const topPatients = (cases: CaseItem[], patients: PatientLike[], n = 10, from?: string, to?: string) => {
  const pats = new Map<string, { name: string; pending: number; received: number; total: number }>();
  const isIn = (c: CaseItem) => (from || to) ? isWithinRange(c.createdAt!, from, to) : true;

  const nameOf = (p?: PatientLike | null) => (p?.name || "—");

  for (const c of cases) {
    if (!isIn(c)) continue;
    const pid = safeId(c.patient);
    if (!pid) continue;
    const p = patients.find(x => safeId(x) === pid);
    if (!p) continue;

    const key = pid;
    if (!pats.has(key)) pats.set(key, { name: nameOf(p), pending: 0, received: 0, total: 0 });

    const bucket = pats.get(key)!;
    bucket.total++;
    const st = normalizeStatus(c.delivery?.status as any);
    if (st === "pending") bucket.pending++;
    if (c.caseApproval?.approved) bucket.received++;
  }

  return Array.from(pats.values())
    .sort((a, b) => b.received - a.received || b.total - a.total)
    .slice(0, n);
};
