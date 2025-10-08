// =======================
// src/components/stats/utils.ts (version simplifiée)
// =======================

export type DeliveryStatus = "pending" | "ready" | "delivered" | "scheduled";

export type CaseItem = {
  _id?: string;
  createdAt?: string | Date;
  delivery?: { status?: DeliveryStatus | string | null };
  caseApproval?: { approved?: boolean | null };
  doctor?: string | { _id?: string };
  patient?: string | { _id?: string };
};

// ------------------------
// Dates
// ------------------------
export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

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

// ------------------------
// Normalisation du statut
// ------------------------
const SAME = (a?: string | null, b?: string) =>
  (a ?? "").toLowerCase() === (b ?? "").toLowerCase();

/** Renvoie exactement l'un des statuts connus, sans “fusion” */
export const normalizeStatusRaw = (s?: string | null): DeliveryStatus => {
  if (SAME(s, "delivered") || SAME(s, "completed")) return "delivered"; // alias legacy
  if (SAME(s, "scheduled")) return "scheduled";
  if (SAME(s, "ready")) return "ready";
  return "pending";
};

// ------------------------
// Toolbar (vues de livraison)
// ------------------------
export type DeliveryView = "all" | "pending" | "scheduled" | "delivered" | "received";

/**
 * Règles d’affichage de la toolbar :
 * - "scheduled" = tout ce qui est PRÊT (scheduled OU ready)
 * - "received"  = delivered && approved
 */
export const matchesDeliveryView = (c: CaseItem, view: DeliveryView): boolean => {
  if (view === "all") return true;

  const raw = normalizeStatusRaw(c.delivery?.status as any);
  const isReceived = raw === "delivered" && !!c.caseApproval?.approved;

  if (view === "received") return isReceived;
  if (view === "delivered") return raw === "delivered";
  if (view === "scheduled") return raw === "scheduled" || raw === "ready";
  // view === "pending"
  return raw === "pending";
};

// ------------------------
// Filtres optionnels
// ------------------------
export type KpiFilters = {
  delivery?: DeliveryView;   // "all" | "pending" | "scheduled" | "delivered" | "received"
  doctorId?: string | null;
  patientId?: string | null;
};

const getId = (v: any): string | null => {
  if (!v) return null;
  return typeof v === "string" ? v : v._id ?? null;
};

export const matchesFilters = (
  it: CaseItem,
  from?: string,
  to?: string,
  f: KpiFilters = {}
) => {
  // 1) vue delivery
  const view = f.delivery ?? "all";
  if (!matchesDeliveryView(it, view)) return false;

  // 2) date
  if (!isWithinRange(it.createdAt!, from, to)) return false;

  // 3) doctor
  if (f.doctorId) {
    if (getId(it.doctor) !== f.doctorId) return false;
  }

  // 4) patient
  if (f.patientId) {
    if (getId(it.patient) !== f.patientId) return false;
  }

  return true;
};

// ------------------------
// KPIs (compteurs simples)
// ------------------------
/**
 * Compte les dossiers selon TES règles :
 * - pending      : status === "pending"
 * - ready        : status === "scheduled" OU "ready" (prêt à livrer)
 * - delivered    : status === "delivered"
 * - received     : delivered && approved === true  (SOUS-ENSEMBLE de delivered)
 *
 * Note: si tu veux des catégories exclusives, utilise `deliveredOnly = delivered - received`.
 */
export const kpisForRange = (
  cases: CaseItem[],
  from: string,
  to: string,
  filters?: KpiFilters
) => {
  let total = 0, pending = 0, ready = 0, delivered = 0, received = 0;

  for (const c of cases) {
    // Applique filtres (si fournis) sinon juste la plage de dates
    if (filters) {
      if (!matchesFilters(c, from, to, filters)) continue;
    } else {
      if (!isWithinRange(c.createdAt!, from, to)) continue;
    }

    total++;

    const raw = normalizeStatusRaw(c.delivery?.status as any);
    const isReceived = raw === "delivered" && !!c.caseApproval?.approved;

    if (raw === "pending") pending++;
    if (raw === "scheduled" || raw === "ready") ready++;
    if (raw === "delivered") delivered++;
    if (isReceived) received++;
  }

  const deliveredOnly = Math.max(0, delivered - received); // livré mais pas encore reçu (exclusif)

  return {
    total,
    pending,
    ready,               // “prêt” (scheduled/ready)
    delivered,           // incluant ceux qui sont “reçus”
    received,            // sous-ensemble de delivered
    deliveredOnly        // utile si tu veux des barres/pastilles exclusives
  };
};


// =======================
// Ajouts "périodes" simples
// =======================

export type PeriodMode = "monthly" | "yearly" | "range";

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const yearKey = (d: Date) => `${d.getFullYear()}`;

const monthsBetween = (from: Date, to: Date) => {
  const res: string[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    res.push(monthKey(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return res;
};

const yearsBetween = (from: Date, to: Date) => {
  const res: string[] = [];
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) res.push(String(y));
  return res;
};

/**
 * Agrégation mensuelle
 * Règles:
 *  - pending      : status === "pending"
 *  - ready        : status === "scheduled" || "ready"
 *  - delivered    : status === "delivered"
 *  - received     : delivered && approved === true (sous-ensemble)
 */
export const aggregateCasesByMonth = (
  cases: CaseItem[],
  from: string,
  to: string,
  filters?: Omit<KpiFilters, "delivery">
) => {
  const fromD = startOfDay(new Date(from));
  const toD = endOfDay(new Date(to));

  const buckets = monthsBetween(fromD, toD).reduce((acc, k) => {
    acc[k] = { pending: 0, ready: 0, delivered: 0, received: 0 };
    return acc;
  }, {} as Record<string, { pending: number; ready: number; delivered: number; received: number }>);

  for (const c of cases) {
    // même logique de filtre que pour les KPI (sans vue delivery imposée)
    if (!matchesFilters(c, from, to, { ...filters, delivery: "all" })) continue;

    const d = new Date(c.createdAt!);
    const key = monthKey(d);
    if (!buckets[key]) continue;

    const raw = normalizeStatusRaw(c.delivery?.status as any);
    const isReceived = raw === "delivered" && !!c.caseApproval?.approved;

    if (raw === "pending") buckets[key].pending += 1;
    if (raw === "scheduled" || raw === "ready") buckets[key].ready += 1;
    if (raw === "delivered") buckets[key].delivered += 1;
    if (isReceived) buckets[key].received += 1;
  }

  return Object.entries(buckets).map(([period, v]) => ({
    period,
    ...v,
    totalStatus: v.pending + v.ready + v.delivered,
    totalInclReceived: v.pending + v.ready + v.delivered + v.received,
    deliveredOnly: Math.max(0, v.delivered - v.received),
  }));
};

/** Agrégation annuelle — même logique que ci-dessus */
export const aggregateCasesByYear = (
  cases: CaseItem[],
  from: string,
  to: string,
  filters?: Omit<KpiFilters, "delivery">
) => {
  const fromD = startOfDay(new Date(from));
  const toD = endOfDay(new Date(to));

  const buckets = yearsBetween(fromD, toD).reduce((acc, k) => {
    acc[k] = { pending: 0, ready: 0, delivered: 0, received: 0 };
    return acc;
  }, {} as Record<string, { pending: number; ready: number; delivered: number; received: number }>);

  for (const c of cases) {
    if (!matchesFilters(c, from, to, { ...filters, delivery: "all" })) continue;

    const d = new Date(c.createdAt!);
    const key = yearKey(d);
    if (!buckets[key]) continue;

    const raw = normalizeStatusRaw(c.delivery?.status as any);
    const isReceived = raw === "delivered" && !!c.caseApproval?.approved;

    if (raw === "pending") buckets[key].pending += 1;
    if (raw === "scheduled" || raw === "ready") buckets[key].ready += 1;
    if (raw === "delivered") buckets[key].delivered += 1;
    if (isReceived) buckets[key].received += 1;
  }

  return Object.entries(buckets).map(([period, v]) => ({
    period,
    ...v,
    totalStatus: v.pending + v.ready + v.delivered,
    totalInclReceived: v.pending + v.ready + v.delivered + v.received,
    deliveredOnly: Math.max(0, v.delivered - v.received),
  }));
};


/** Convertit une date en format "YYYY-MM-DD" */
export const toYMD = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};


// =======================
// Top Doctors / Patients
// =======================

export type UserLike = {
  _id?: string;
  doctor?: { isDoctor?: boolean } | null;
  fullName?: string;
  username?: string;
};

export type PatientLike = {
  _id?: string;
  name?: string;
};

const safeId = (v: any): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v;
  return v._id ?? null;
};

/**
 * Classement des docteurs selon :
 *  - nombre total de dossiers
 *  - nombre de dossiers reçus (livrés + approuvés)
 *  - nombre en attente
 */
export const topDoctors = (
  cases: CaseItem[],
  users: UserLike[],
  n = 10,
  from?: string,
  to?: string
) => {
  const docs = new Map<string, { name: string; pending: number; received: number; total: number }>();
  const isInRange = (c: CaseItem) => (from || to) ? isWithinRange(c.createdAt!, from, to) : true;
  const nameOf = (u?: UserLike | null) => (u?.fullName || u?.username || "—");

  for (const c of cases) {
    if (!isInRange(c)) continue;

    const did = safeId(c.doctor);
    if (!did) continue;

    const u = users.find(x => safeId(x) === did);
    if (!u || !(u.doctor?.isDoctor)) continue;

    if (!docs.has(did)) docs.set(did, { name: nameOf(u), pending: 0, received: 0, total: 0 });
    const bucket = docs.get(did)!;

    bucket.total++;
    const status = normalizeStatusRaw(c.delivery?.status as any);
    const isReceived = status === "delivered" && !!c.caseApproval?.approved;
    if (status === "pending") bucket.pending++;
    if (isReceived) bucket.received++;
  }

  return Array.from(docs.values())
    .sort((a, b) => b.received - a.received || b.total - a.total)
    .slice(0, n);
};

/**
 * Classement des patients selon :
 *  - nombre total de dossiers
 *  - nombre reçus
 *  - nombre en attente
 */
export const topPatients = (
  cases: CaseItem[],
  patients: PatientLike[],
  n = 10,
  from?: string,
  to?: string
) => {
  const pats = new Map<string, { name: string; pending: number; received: number; total: number }>();
  const isInRange = (c: CaseItem) => (from || to) ? isWithinRange(c.createdAt!, from, to) : true;
  const nameOf = (p?: PatientLike | null) => (p?.name || "—");

  for (const c of cases) {
    if (!isInRange(c)) continue;

    const pid = safeId(c.patient);
    if (!pid) continue;

    const p = patients.find(x => safeId(x) === pid);
    if (!p) continue;

    if (!pats.has(pid)) pats.set(pid, { name: nameOf(p), pending: 0, received: 0, total: 0 });
    const bucket = pats.get(pid)!;

    bucket.total++;
    const status = normalizeStatusRaw(c.delivery?.status as any);
    const isReceived = status === "delivered" && !!c.caseApproval?.approved;
    if (status === "pending") bucket.pending++;
    if (isReceived) bucket.received++;
  }

  return Array.from(pats.values())
    .sort((a, b) => b.received - a.received || b.total - a.total)
    .slice(0, n);
};
