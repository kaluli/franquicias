import type { Franchise } from "./types";

// ROI = beneficio anual / inversión total × 100 (si no se ha introducido a mano)
export function roiOf(f: Franchise): number | null {
  const fin = f.financials;
  if (!fin) return null;
  if (fin.roi_pct !== null) return fin.roi_pct;
  if (fin.profit !== null && fin.investment) {
    return (fin.profit / fin.investment) * 100;
  }
  return null;
}

export function marginOf(f: Franchise): number | null {
  const fin = f.financials;
  if (!fin) return null;
  if (fin.margin_pct !== null) return fin.margin_pct;
  if (fin.profit !== null && fin.revenue) return (fin.profit / fin.revenue) * 100;
  return null;
}

export function paybackOf(f: Franchise): number | null {
  const fin = f.financials;
  if (!fin) return null;
  if (fin.payback_months !== null) return fin.payback_months;
  if (fin.profit && fin.investment) return (fin.investment / fin.profit) * 12;
  return null;
}
