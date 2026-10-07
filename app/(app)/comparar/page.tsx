"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { type CriterionKey } from "@/lib/catalog";
import { eur, months, pct } from "@/lib/format";
import { roiOf } from "@/lib/metrics";
import { byScore, useFranchises } from "@/lib/use-franchises";
import type { Franchise } from "@/lib/types";
import { Card, Chip, ErrorBox, Spinner, Stars } from "@/components/ui";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  get: (f: Franchise) => number | null;
  fmt: (n: number | null, f: Franchise) => React.ReactNode;
  better: "high" | "low";
};

const rating = (key: CriterionKey, label: string): Metric => ({
  label,
  better: "high",
  get: (f) => f.ratings[key] ?? null,
  fmt: (n) => (n === null ? "—" : <Stars value={n} size={16} />),
});

const METRICS: Metric[] = [
  { label: "Score", better: "high", get: (f) => f.score, fmt: (n) => (n === null ? "—" : `${n}/100`) },
  { label: "Inversión", better: "low", get: (f) => f.financials?.investment ?? null, fmt: (n) => eur(n) },
  { label: "Facturación", better: "high", get: (f) => f.financials?.revenue ?? null, fmt: (n) => eur(n) },
  { label: "Beneficio", better: "high", get: (f) => f.financials?.profit ?? null, fmt: (n) => eur(n) },
  { label: "ROI", better: "high", get: roiOf, fmt: (n) => pct(n) },
  { label: "Break-even", better: "low", get: (f) => f.financials?.breakeven_months ?? null, fmt: (n) => months(n) },
  { label: "Royalty", better: "low", get: (f) => f.financials?.royalty_pct ?? null, fmt: (n) => pct(n, 1) },
  rating("riesgo", "Riesgo (5 = bajo)"),
  rating("rentabilidad", "Rentabilidad"),
  rating("independencia", "Independencia del propietario"),
  rating("recurrencia", "Recurrencia"),
  rating("crecimiento", "Crecimiento"),
  rating("central", "Calidad de la central"),
  rating("salida", "Facilidad de salida"),
];

function winners(list: Franchise[], m: Metric): Set<string> {
  const vals = list.flatMap((f) => {
    const v = m.get(f);
    return v === null ? [] : [{ id: f.id, v }];
  });
  if (vals.length < 2) return new Set();
  const best = m.better === "high" ? Math.max(...vals.map((x) => x.v)) : Math.min(...vals.map((x) => x.v));
  if (vals.every((x) => x.v === best)) return new Set();
  return new Set(vals.filter((x) => x.v === best).map((x) => x.id));
}

export default function CompararPage() {
  const { data, error } = useFranchises();
  const [picked, setPicked] = useState<string[] | null>(null);

  const sorted = useMemo(() => [...(data ?? [])].sort(byScore), [data]);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Spinner />;
  const selected = picked ?? sorted.slice(0, 3).map((f) => f.id);

  const chosen = sorted.filter((f) => selected.includes(f.id));
  const toggle = (id: string) =>
    setPicked(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">🏆 Comparar</h1>
        <p className="text-sm text-muted">Elige las franquicias. El ganador de cada categoría se resalta.</p>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center text-muted">Aún no hay franquicias que comparar.</Card>
      ) : (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0 [scrollbar-width:none]">
          {sorted.map((f) => (
            <Chip key={f.id} active={selected.includes(f.id)} onClick={() => toggle(f.id)}>
              {f.name} <span className="opacity-60">{f.score ?? "—"}</span>
            </Chip>
          ))}
        </div>
      )}

      {chosen.length < 2 ? (
        data.length > 0 && <p className="py-8 text-center text-muted">Selecciona al menos 2 franquicias.</p>
      ) : (
        <>
          {/* Móvil: una tarjeta por categoría */}
          <div className="space-y-3 md:hidden">
            {METRICS.map((m) => {
              const win = winners(chosen, m);
              return (
                <Card key={m.label} className="p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{m.label}</div>
                  <div className="space-y-1.5">
                    {chosen.map((f) => (
                      <div
                        key={f.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
                          win.has(f.id) ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-zinc-50",
                        )}
                      >
                        <span className="min-w-0 truncate text-sm font-medium">
                          {win.has(f.id) && <Trophy className="mr-1.5 inline size-3.5 text-emerald-600" />}
                          {f.name}
                        </span>
                        <span className={cn("shrink-0 text-sm tabular-nums", win.has(f.id) && "font-semibold text-emerald-700")}>
                          {m.fmt(m.get(f), f)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop: tabla */}
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted"></th>
                  {chosen.map((f) => (
                    <th key={f.id} className="px-4 py-3 text-left font-semibold">{f.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {METRICS.map((m) => {
                  const win = winners(chosen, m);
                  return (
                    <tr key={m.label}>
                      <td className="px-4 py-3 font-medium text-zinc-600">{m.label}</td>
                      {chosen.map((f) => (
                        <td key={f.id} className={cn("px-4 py-3 tabular-nums", win.has(f.id) && "bg-emerald-50 font-semibold text-emerald-700")}>
                          {win.has(f.id) && <Trophy className="mr-1.5 inline size-3.5" />}
                          {m.fmt(m.get(f), f)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
