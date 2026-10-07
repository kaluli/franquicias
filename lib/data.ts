import * as act from "./actions";
import { computeScore, type Ratings } from "./score";
import type { AnswerStatus, CriterionKey } from "./catalog";
import type { Answer, Financials, Franchise, FranchiseRow } from "./types";

// ───────── Borrador de formulario (strings para inputs) ─────────

export const FIN_FIELDS = [
  "entry_fee",
  "investment",
  "own_capital",
  "revenue",
  "profit",
  "margin_pct",
  "royalty_pct",
  "ad_fee_pct",
  "other_costs",
  "rent",
  "staff",
  "working_capital",
  "breakeven_months",
  "roi_pct",
  "payback_months",
] as const;
export type FinKey = (typeof FIN_FIELDS)[number];

export type Draft = {
  name: string;
  category: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  visit_date: string;
  status: string;
  fin: Record<FinKey, string>;
  ratings: Ratings;
  answers: Record<string, Answer>;
  red_flags: string[];
  green_flags: string[];
  impression: string;
};

export function emptyDraft(): Draft {
  return {
    name: "",
    category: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    visit_date: new Date().toISOString().slice(0, 10),
    status: "analizar",
    fin: Object.fromEntries(FIN_FIELDS.map((k) => [k, ""])) as Record<FinKey, string>,
    ratings: {},
    answers: {},
    red_flags: [],
    green_flags: [],
    impression: "",
  };
}

export function draftFromFranchise(f: Franchise, answers: Answer[]): Draft {
  const d = emptyDraft();
  d.name = f.name;
  d.category = f.category ?? "";
  d.contact_name = f.contact_name ?? "";
  d.email = f.email ?? "";
  d.phone = f.phone ?? "";
  d.website = f.website ?? "";
  d.location = f.location ?? "";
  d.visit_date = f.visit_date ?? "";
  d.status = f.status;
  d.red_flags = f.red_flags ?? [];
  d.green_flags = f.green_flags ?? [];
  d.impression = f.impression ?? "";
  d.ratings = { ...f.ratings };
  for (const k of FIN_FIELDS) {
    const v = f.financials?.[k];
    d.fin[k] = v === null || v === undefined ? "" : String(v);
  }
  for (const a of answers) d.answers[a.question_id] = a;
  return d;
}

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const txt = (s: string) => (s.trim() ? s.trim() : null);

// ───────── Lectura ─────────

type Raw = FranchiseRow & {
  financials: Financials | null;
  ratings: { criterion: CriterionKey; stars: number }[];
};

function hydrate(r: Raw): Franchise {
  const ratings: Ratings = {};
  for (const x of r.ratings ?? []) ratings[x.criterion] = x.stars;
  const { financials, ratings: _r, ...row } = r;
  void _r;
  return { ...row, financials, ratings, score: computeScore(ratings) };
}

export async function fetchFranchises(): Promise<Franchise[]> {
  return ((await act.listFranchisesAction()) as Raw[]).map(hydrate);
}

export async function fetchFranchise(id: string) {
  const r = await act.getFranchiseAction(id);
  return { franchise: hydrate(r.raw as Raw), answers: r.answers, followups: r.followups };
}

// ───────── Escritura ─────────

export async function saveDraft(draft: Draft, id?: string): Promise<string> {
  const fin: Record<string, number | null> = {};
  for (const k of FIN_FIELDS) fin[k] = num(draft.fin[k]);
  return act.saveFranchiseAction({
    id,
    row: {
      name: draft.name.trim(),
      category: txt(draft.category),
      contact_name: txt(draft.contact_name),
      email: txt(draft.email),
      phone: txt(draft.phone),
      website: txt(draft.website),
      location: txt(draft.location),
      visit_date: txt(draft.visit_date),
      status: draft.status,
      red_flags: draft.red_flags,
      green_flags: draft.green_flags,
      impression: txt(draft.impression),
    },
    fin,
    ratings: draft.ratings,
    answers: Object.values(draft.answers).filter(
      (a) => a.answer.trim() || a.notes.trim() || a.status !== "not_asked",
    ),
  });
}

export const setStatus = act.setStatusAction;
export const deleteFranchise = act.deleteFranchiseAction;
export const addFollowup = (franchise_id: string, note: string, due_date: string | null) =>
  act.addFollowupAction(franchise_id, note, due_date);
export const updateFollowup = (id: string, patch: { done: boolean }) => act.setFollowupDoneAction(id, patch.done);
export const deleteFollowup = act.deleteFollowupAction;

export type { AnswerStatus };
