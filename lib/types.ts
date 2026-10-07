import type { AnswerStatus, CriterionKey } from "./catalog";

export type Financials = {
  franchise_id: string;
  entry_fee: number | null;
  investment: number | null;
  own_capital: number | null;
  revenue: number | null;
  profit: number | null;
  margin_pct: number | null;
  royalty_pct: number | null;
  ad_fee_pct: number | null;
  other_costs: number | null;
  rent: number | null;
  staff: number | null;
  working_capital: number | null;
  breakeven_months: number | null;
  roi_pct: number | null;
  payback_months: number | null;
};

export type FranchiseRow = {
  id: string;
  name: string;
  category: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  visit_date: string | null;
  status: string;
  red_flags: string[];
  green_flags: string[];
  impression: string | null;
  created_at: string;
  updated_at: string;
};

export type Franchise = FranchiseRow & {
  financials: Financials | null;
  ratings: Partial<Record<CriterionKey, number>>;
  score: number | null;
};

export type Answer = {
  question_id: string;
  answer: string;
  status: AnswerStatus;
  notes: string;
};

export type Followup = {
  id: string;
  franchise_id: string;
  note: string;
  due_date: string | null;
  done: boolean;
  created_at: string;
};
