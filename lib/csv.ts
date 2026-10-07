import { CATEGORIES, CRITERIA, statusOf } from "./catalog";
import { marginOf, paybackOf, roiOf } from "./metrics";
import type { Franchise } from "./types";

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const r1 = (n: number | null) => (n === null ? "" : Math.round(n * 10) / 10);

export function exportCsv(list: Franchise[]) {
  const header = [
    "Nombre", "Categoría", "Estado", "Score", "Contacto", "Email", "Teléfono", "Web",
    "Ubicación", "Fecha visita", "Canon entrada", "Inversión", "Capital propio",
    "Facturación", "Beneficio", "Margen %", "Royalty %", "Canon publicidad %",
    "Otros costes", "Alquiler", "Personal", "Capital circulante", "Break-even (meses)",
    "ROI %", "Payback (meses)",
    ...CRITERIA.map((c) => c.label),
    "Red flags", "Green flags", "Impresión",
  ];
  const rows = list.map((f) => {
    const fin = f.financials;
    return [
      f.name,
      CATEGORIES.find((c) => c.value === f.category)?.label ?? f.category,
      statusOf(f.status).label,
      f.score,
      f.contact_name, f.email, f.phone, f.website, f.location, f.visit_date,
      fin?.entry_fee, fin?.investment, fin?.own_capital, fin?.revenue, fin?.profit,
      r1(marginOf(f)), fin?.royalty_pct, fin?.ad_fee_pct, fin?.other_costs, fin?.rent,
      fin?.staff, fin?.working_capital, fin?.breakeven_months, r1(roiOf(f)), r1(paybackOf(f)),
      ...CRITERIA.map((c) => f.ratings[c.key]),
      f.red_flags.join(" | "), f.green_flags.join(" | "), f.impression,
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(esc).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `franquicias-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
