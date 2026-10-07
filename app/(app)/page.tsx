"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Plus, Search, SlidersHorizontal, Zap } from "lucide-react";
import { CATEGORIES, STATUSES, categoryOf, statusOf } from "@/lib/catalog";
import { exportCsv } from "@/lib/csv";
import { eurShort, pct } from "@/lib/format";
import { roiOf } from "@/lib/metrics";
import { scoreToStars } from "@/lib/score";
import { byScore, useFranchises } from "@/lib/use-franchises";
import { takeFlash } from "@/lib/flash";
import { FranchiseCard } from "@/components/franchise-card";
import { Badge, Button, Card, Chip, ErrorBox, Field, Input, Select, Spinner, Stars, Stat, VerdictBadge } from "@/components/ui";
import type { Franchise } from "@/lib/types";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export default function Dashboard() {
  const { data, error } = useFranchises();
  const [flash, setFlash] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxInv, setMaxInv] = useState("");
  const [minRoi, setMinRoi] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");

  useEffect(() => {
    let hide: ReturnType<typeof setTimeout>;
    const show = setTimeout(() => {
      const m = takeFlash();
      if (!m) return;
      setFlash(m);
      hide = setTimeout(() => setFlash(null), 3500);
    }, 0);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      finalists: all.filter((f) => f.status === "finalista").length,
      avgScore: avg(all.flatMap((f) => (f.score !== null ? [f.score] : []))),
      avgInv: avg(all.flatMap((f) => (f.financials?.investment != null ? [f.financials.investment] : []))),
    };
  }, [data]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const num = (s: string) => (s.trim() === "" ? null : parseFloat(s.replace(",", ".")));
    const ms = num(minScore), mi = num(maxInv), mr = num(minRoi);
    return (data ?? [])
      .filter((f) => {
        if (status && f.status !== status) return false;
        if (category && f.category !== category) return false;
        if (ms !== null && (f.score ?? -1) < ms) return false;
        if (mi !== null && (f.financials?.investment ?? Infinity) > mi * 1000) return false;
        if (mr !== null && (roiOf(f) ?? -Infinity) < mr) return false;
        if (fromDate && (f.visit_date ?? "") < fromDate) return false;
        if (needle) {
          const hay = [
            f.name, categoryOf(f.category)?.label, f.contact_name, f.location,
            f.impression, ...f.red_flags, ...f.green_flags,
          ].join(" ").toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort(byScore);
  }, [data, q, status, category, minScore, maxInv, minRoi, fromDate]);

  const activeFilters = [category, minScore, maxInv, minRoi, fromDate].filter(Boolean).length;
  const clear = () => {
    setCategory(""); setMinScore(""); setMaxInv(""); setMinRoi(""); setFromDate("");
  };

  return (
    <div className="space-y-6">
      {flash && (
        <div className="fixed inset-x-4 top-16 z-50 mx-auto max-w-sm rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
          {flash}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Franchise Evaluator</h1>
        <p className="mt-1 text-muted">Decide con datos, no con la emoción de la feria.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/nueva">
            <Button size="lg" className="w-full sm:w-auto"><Plus className="size-5" /> Nueva franquicia</Button>
          </Link>
          <Link href="/feria">
            <Button size="lg" variant="dark" className="w-full sm:w-auto"><Zap className="size-5" /> Modo Feria</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value={stats.total} label="Franquicias" />
        <Stat value={stats.finalists} label="Finalistas" />
        <Stat value={stats.avgScore !== null ? `${Math.round(stats.avgScore)}/100` : "—"} label="Score medio" />
        <Stat value={eurShort(stats.avgInv)} label="Inversión media" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">🏆 Ranking</h2>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-border bg-white p-0.5 md:flex">
              {(["cards", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`h-8 rounded-md px-3 text-sm font-medium ${view === v ? "bg-zinc-900 text-white" : "text-zinc-600"}`}
                >
                  {v === "cards" ? "Tarjetas" : "Tabla"}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              <Download className="size-4" /> CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input className="pl-10" placeholder="Buscar franquicia..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button variant="secondary" className="relative px-4" onClick={() => setShowFilters((s) => !s)} aria-label="Filtros">
            <SlidersHorizontal className="size-4" />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] text-white">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Chip active={!status} onClick={() => setStatus("")}>Todas</Chip>
          {STATUSES.map((s) => (
            <Chip key={s.value} active={status === s.value} onClick={() => setStatus(status === s.value ? "" : s.value)}>
              {s.emoji} {s.label}
            </Chip>
          ))}
        </div>

        {showFilters && (
          <Card className="grid grid-cols-2 gap-3 p-4 md:grid-cols-5">
            <Field label="Categoría" className="col-span-2 md:col-span-1">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Score mínimo">
              <Select value={minScore} onChange={(e) => setMinScore(e.target.value)}>
                <option value="">Cualquiera</option>
                {[60, 70, 80, 90].map((n) => <option key={n} value={n}>≥ {n}</option>)}
              </Select>
            </Field>
            <Field label="Inversión máx. (K€)">
              <Input inputMode="decimal" placeholder="100" value={maxInv} onChange={(e) => setMaxInv(e.target.value)} />
            </Field>
            <Field label="ROI mínimo (%)">
              <Input inputMode="decimal" placeholder="30" value={minRoi} onChange={(e) => setMinRoi(e.target.value)} />
            </Field>
            <Field label="Visita desde">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </Field>
            {activeFilters > 0 && (
              <button onClick={clear} className="col-span-2 h-10 text-sm font-medium text-accent md:col-span-5">
                Limpiar filtros
              </button>
            )}
          </Card>
        )}
      </div>

      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <Spinner />
      ) : data.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl">🏁</div>
          <h3 className="mt-3 text-lg font-semibold">Aún no hay franquicias</h3>
          <p className="mt-1 text-sm text-muted">Pulsa Modo Feria para registrar la primera en menos de 2 minutos.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-muted">Ninguna franquicia coincide con los filtros.</p>
      ) : view === "cards" ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f, i) => <FranchiseCard key={f.id} f={f} rank={i + 1} />)}
        </div>
      ) : (
        <RankingTable list={filtered} />
      )}
    </div>
  );
}

function RankingTable({ list }: { list: Franchise[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-zinc-50 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {["#", "Franquicia", "Score", "Inversión", "Beneficio", "ROI", "Break-even", "Estado"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {list.map((f, i) => (
            <tr key={f.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 tabular-nums text-muted">{i + 1}</td>
              <td className="px-4 py-3">
                <Link href={`/f/${f.id}`} className="font-semibold hover:text-accent">{f.name}</Link>
                <div className="text-xs text-muted">{categoryOf(f.category)?.label ?? "—"}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold tabular-nums">{f.score ?? "—"}</div>
                <Stars value={scoreToStars(f.score)} size={12} />
              </td>
              <td className="px-4 py-3 tabular-nums">{eurShort(f.financials?.investment)}</td>
              <td className="px-4 py-3 tabular-nums">{eurShort(f.financials?.profit)}</td>
              <td className="px-4 py-3 tabular-nums">{pct(roiOf(f))}</td>
              <td className="px-4 py-3 tabular-nums">{f.financials?.breakeven_months != null ? `${Math.round(f.financials.breakeven_months)} m` : "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Badge>{statusOf(f.status).emoji} {statusOf(f.status).label}</Badge>
                  <VerdictBadge score={f.score} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
