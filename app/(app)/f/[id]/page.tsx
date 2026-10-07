"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Pencil, Phone, Printer, Trash2, Globe, Plus } from "lucide-react";
import {
  ALL_QUESTIONS, ANSWER_STATUSES, CRITERIA, CRITICAL_QUESTIONS, STATUSES, categoryOf,
} from "@/lib/catalog";
import {
  addFollowup, deleteFollowup, deleteFranchise, fetchFranchise, setStatus, updateFollowup,
} from "@/lib/data";
import { dateEs, eur, months, pct } from "@/lib/format";
import { marginOf, paybackOf, roiOf } from "@/lib/metrics";
import { setFlash } from "@/lib/flash";
import type { Answer, Followup, Franchise } from "@/lib/types";
import { ScoreSummary } from "@/components/score-summary";
import { Badge, Button, Card, ErrorBox, Input, ProgressBar, Select, Spinner, Stars } from "@/components/ui";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [f, setF] = useState<Franchise | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    fetchFranchise(id)
      .then((r) => {
        setF(r.franchise);
        setAnswers(r.answers);
        setFollowups(r.followups);
      })
      .catch(setError);
  }, [id]);

  if (error) return <ErrorBox error={error} />;
  if (!f) return <Spinner />;

  const cat = categoryOf(f.category);
  const fin = f.financials;
  const ansMap = new Map(answers.map((a) => [a.question_id, a]));
  const kpis = [
    { v: eur(fin?.investment), l: "Inversión" },
    { v: eur(fin?.profit), l: "Beneficio" },
    { v: pct(roiOf(f)), l: "ROI" },
    { v: months(fin?.breakeven_months), l: "Break-even" },
  ];

  async function changeStatus(s: string) {
    setF({ ...f!, status: s });
    try {
      await setStatus(f!.id, s);
    } catch (e) {
      setError(e);
    }
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${f!.name}" para siempre?`)) return;
    try {
      await deleteFranchise(f!.id);
      setFlash("Franquicia eliminada");
      router.push("/");
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <Link href="/" className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-zinc-600">
          <ArrowLeft className="size-4" /> Ranking
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => window.print()}>
            <Printer className="size-4" /> PDF
          </Button>
          <Link href={`/f/${f.id}/editar`}>
            <Button variant="secondary" className="h-10 px-3 text-sm"><Pencil className="size-4" /> Editar</Button>
          </Link>
        </div>
      </div>

      <div>
        <div className="text-sm text-muted">{cat ? `${cat.emoji} ${cat.label}` : "Sin categoría"}{f.location ? ` · ${f.location}` : ""}</div>
        <h1 className="text-3xl font-semibold tracking-tight">{f.name}</h1>
      </div>

      <ScoreSummary score={f.score} />

      <div className="no-print">
        <Select value={f.status} onChange={(e) => changeStatus(e.target.value)} aria-label="Estado">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.l} className="p-4">
            <div className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{k.v}</div>
            <div className="mt-0.5 text-sm text-muted">{k.l}</div>
          </Card>
        ))}
      </div>

      <Section title="⭐ Evaluación">
        <div className="divide-y divide-border">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 py-3">
              <div className="text-sm font-medium">{c.emoji} {c.label}</div>
              <Stars value={f.ratings[c.key] ?? 0} size={20} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="💰 Números">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          {[
            ["Canon de entrada", eur(fin?.entry_fee)],
            ["Capital propio", eur(fin?.own_capital)],
            ["Capital circulante", eur(fin?.working_capital)],
            ["Facturación media", eur(fin?.revenue)],
            ["Margen operativo", pct(marginOf(f), 1)],
            ["Royalty", pct(fin?.royalty_pct, 1)],
            ["Canon publicidad", pct(fin?.ad_fee_pct, 1)],
            ["Otros costes", eur(fin?.other_costs)],
            ["Alquiler estimado", eur(fin?.rent)],
            ["Personal", fin?.staff != null ? `${fin.staff} personas` : "—"],
            ["Payback", months(paybackOf(f))],
          ].map(([l, v]) => (
            <div key={l}>
              <dt className="text-muted">{l}</dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {roiOf(f) !== null && <ProgressBar className="mt-4 h-3" value={roiOf(f)!} tone={roiOf(f)! >= 40 ? "green" : roiOf(f)! >= 20 ? "amber" : "red"} />}
      </Section>

      <Section title="❓ Preguntas">
        <QA title="🔥 Preguntas críticas" ids={CRITICAL_QUESTIONS.map((q) => q.id)} ansMap={ansMap} showEmpty />
        {[...new Set(ALL_QUESTIONS.filter((q) => !q.id.startsWith("crit")).map((q) => q.category))].map((cat) => (
          <QA key={cat} title={cat} ids={ALL_QUESTIONS.filter((q) => q.category === cat).map((q) => q.id)} ansMap={ansMap} />
        ))}
      </Section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="🚩 Red Flags">
          <Flags items={f.red_flags} tone="red" />
        </Section>
        <Section title="🟢 Green Flags">
          <Flags items={f.green_flags} tone="green" />
        </Section>
      </div>

      <Section title="📝 Mi impresión">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{f.impression || <span className="text-muted">Sin notas todavía.</span>}</p>
      </Section>

      <Section title="📞 Contacto">
        <div className="space-y-2 text-[15px]">
          <div className="font-medium">{f.contact_name || <span className="text-muted">Sin contacto</span>}</div>
          {f.email && <a className="flex items-center gap-2 text-accent" href={`mailto:${f.email}`}><Mail className="size-4" />{f.email}</a>}
          {f.phone && <a className="flex items-center gap-2 text-accent" href={`tel:${f.phone}`}><Phone className="size-4" />{f.phone}</a>}
          {f.website && <a className="flex items-center gap-2 text-accent" href={f.website} target="_blank" rel="noreferrer"><Globe className="size-4" />{f.website}</a>}
          <div className="text-sm text-muted">Visita: {dateEs(f.visit_date)}</div>
        </div>
      </Section>

      <Followups franchiseId={f.id} items={followups} setItems={setFollowups} onError={setError} />

      <div className="no-print pt-4">
        <Button variant="danger" onClick={remove}><Trash2 className="size-4" /> Eliminar franquicia</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="break-inside-avoid p-4 sm:p-5">
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </Card>
  );
}

function Flags({ items, tone }: { items: string[]; tone: "red" | "green" }) {
  if (!items.length) return <p className="text-sm text-muted">Ninguna.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => <Badge key={i} tone={tone === "red" ? "red" : "green"} className="text-sm">{i}</Badge>)}
    </div>
  );
}

function QA({ title, ids, ansMap, showEmpty }: { title: string; ids: string[]; ansMap: Map<string, Answer>; showEmpty?: boolean }) {
  const rows = ids
    .map((id) => ({ q: ALL_QUESTIONS.find((x) => x.id === id)!, a: ansMap.get(id) }))
    .filter((r) => showEmpty || (r.a && (r.a.answer || r.a.notes || r.a.status !== "not_asked")));
  if (!rows.length) return null;
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-1 text-sm font-semibold text-zinc-500">{title}</h3>
      <div className="divide-y divide-border">
        {rows.map(({ q, a }) => {
          const st = ANSWER_STATUSES.find((s) => s.value === (a?.status ?? "not_asked"))!;
          return (
            <div key={q.id} className="py-2.5 text-sm">
              <div className="font-medium">{q.text}</div>
              <div className="mt-0.5 text-zinc-600">
                <span className="mr-1.5">{st.emoji}</span>
                {a?.answer || <span className="text-muted">{st.label}</span>}
              </div>
              {a?.notes && <div className="mt-0.5 text-xs italic text-muted">{a.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Followups({
  franchiseId, items, setItems, onError,
}: {
  franchiseId: string;
  items: Followup[];
  setItems: (f: Followup[]) => void;
  onError: (e: unknown) => void;
}) {
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");

  async function add() {
    if (!note.trim()) return;
    try {
      const f = await addFollowup(franchiseId, note.trim(), due || null);
      setItems([...items, f]);
      setNote("");
      setDue("");
    } catch (e) {
      onError(e);
    }
  }
  async function toggle(f: Followup) {
    setItems(items.map((i) => (i.id === f.id ? { ...i, done: !i.done } : i)));
    try { await updateFollowup(f.id, { done: !f.done }); } catch (e) { onError(e); }
  }
  async function remove(f: Followup) {
    setItems(items.filter((i) => i.id !== f.id));
    try { await deleteFollowup(f.id); } catch (e) { onError(e); }
  }

  return (
    <Section title="📅 Seguimiento">
      <div className="space-y-1">
        {items.length === 0 && <p className="pb-2 text-sm text-muted">Sin tareas pendientes.</p>}
        {items.map((f) => (
          <div key={f.id} className="flex items-center gap-3">
            <button onClick={() => toggle(f)} aria-label="Marcar" className="flex size-11 shrink-0 items-center justify-center">
              <span className={`flex size-6 items-center justify-center rounded-md border ${f.done ? "border-accent bg-accent text-white" : "border-zinc-300"}`}>
                {f.done && "✓"}
              </span>
            </button>
            <div className={`min-w-0 flex-1 text-[15px] ${f.done ? "text-muted line-through" : ""}`}>
              {f.note}
              {f.due_date && <span className="ml-2 text-xs text-muted">{dateEs(f.due_date)}</span>}
            </div>
            <button onClick={() => remove(f)} aria-label="Borrar" className="no-print flex size-11 items-center justify-center text-zinc-400"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
      <div className="no-print mt-3 flex flex-col gap-2 sm:flex-row">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: Pedir números reales por email" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="sm:w-44" />
        <Button onClick={add} aria-label="Añadir"><Plus className="size-5" /></Button>
      </div>
    </Section>
  );
}

