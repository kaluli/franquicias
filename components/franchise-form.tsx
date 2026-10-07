"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES, CRITERIA, CRITICAL_QUESTIONS, GREEN_FLAG_PRESETS, QUESTION_GROUPS, RED_FLAG_PRESETS, STATUSES,
} from "@/lib/catalog";
import { saveDraft, type Draft, type FinKey } from "@/lib/data";
import { setFlash } from "@/lib/flash";
import { computeScore } from "@/lib/score";
import { FlagsEditor } from "./flags-editor";
import { QuestionRow } from "./question-row";
import { ScoreSummary } from "./score-summary";
import { Button, Card, ErrorBox, Field, Input, NumberInput, ProgressBar, Select, Stars, Textarea } from "./ui";

const STEPS = ["Básico", "Números", "Preguntas", "Evaluación"];
const n = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

export function FranchiseForm({ initial, id }: { initial: Draft; id?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setFin = (k: FinKey, v: string) => setD((p) => ({ ...p, fin: { ...p.fin, [k]: v } }));
  const go = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function save() {
    if (!d.name.trim()) {
      setError(new Error("Falta el nombre de la empresa (paso 1)."));
      go(0);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fid = await saveDraft(d, id);
      setFlash("Franquicia guardada ✓");
      router.push(id ? `/f/${fid}` : "/");
    } catch (e) {
      setError(e);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{id ? "Editar franquicia" : "Nueva franquicia"}</h1>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => go(i)} className="text-left">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-accent" : "bg-zinc-200")} />
              <div className={cn("mt-1.5 text-xs font-medium", i === step ? "text-zinc-900" : "text-muted")}>
                {i + 1}. {s}
              </div>
            </button>
          ))}
        </div>
      </div>

      {step === 0 && <StepBasic d={d} set={set} />}
      {step === 1 && <StepNumbers d={d} setFin={setFin} />}
      {step === 2 && <StepQuestions d={d} set={set} />}
      {step === 3 && <StepEvaluation d={d} set={set} />}

      {error ? <ErrorBox error={error} /> : null}

      <div className="sticky bottom-20 z-20 flex gap-2 md:bottom-4">
        {step > 0 && (
          <Button variant="secondary" size="lg" className="shadow-lg" onClick={() => go(step - 1)} aria-label="Atrás">
            <ArrowLeft className="size-5" />
          </Button>
        )}
        {step < 3 ? (
          <>
            <Button size="lg" className="flex-1 shadow-lg" onClick={() => go(step + 1)}>
              Siguiente <ArrowRight className="size-5" />
            </Button>
            <Button variant="dark" size="lg" className="shadow-lg" onClick={save} disabled={saving} aria-label="Guardar">
              <Check className="size-5" />
            </Button>
          </>
        ) : (
          <Button size="lg" className="flex-1 shadow-lg" onClick={save} disabled={saving}>
            <Check className="size-5" /> {saving ? "Guardando…" : "Guardar"}
          </Button>
        )}
      </div>
    </div>
  );
}

type SetFn = <K extends keyof Draft>(k: K, v: Draft[K]) => void;

function StepBasic({ d, set }: { d: Draft; set: SetFn }) {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <Field label="Nombre de la empresa *">
        <Input value={d.name} onChange={(e) => set("name", e.target.value)} autoFocus />
      </Field>
      <Field label="Categoría">
        <Select value={d.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">Elegir…</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </Select>
      </Field>
      <Field label="Persona de contacto">
        <Input value={d.contact_name} onChange={(e) => set("contact_name", e.target.value)} autoComplete="off" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email"><Input type="email" inputMode="email" value={d.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Teléfono"><Input type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      </div>
      <Field label="Web"><Input type="url" inputMode="url" placeholder="https://" value={d.website} onChange={(e) => set("website", e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ubicación / zona"><Input value={d.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Fecha de visita"><Input type="date" value={d.visit_date} onChange={(e) => set("visit_date", e.target.value)} /></Field>
      </div>
    </Card>
  );
}

function StepNumbers({ d, setFin }: { d: Draft; setFin: (k: FinKey, v: string) => void }) {
  const f = d.fin;
  const inv = n(f.investment), profit = n(f.profit), rev = n(f.revenue);
  const roi = n(f.roi_pct) ?? (inv && profit !== null ? (profit / inv) * 100 : null);
  const margin = n(f.margin_pct) ?? (rev && profit !== null ? (profit / rev) * 100 : null);
  const payback = n(f.payback_months) ?? (inv && profit ? (inv / profit) * 12 : null);

  const eur = (k: FinKey, label: string, hint?: string) => (
    <Field label={label} hint={hint}><NumberInput prefix="€" value={f[k]} onChange={(v) => setFin(k, v)} /></Field>
  );
  const pc = (k: FinKey, label: string, auto?: number | null) => (
    <Field label={label} hint={auto != null && !f[k] ? `Auto: ${auto.toFixed(1)}%` : undefined}>
      <NumberInput suffix="%" value={f[k]} onChange={(v) => setFin(k, v)} placeholder={auto != null ? auto.toFixed(1) : undefined} />
    </Field>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">💰 Números</h2>
      <Card className="p-5">
        <div className="text-sm text-muted">ROI anual</div>
        <div className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
          {roi !== null ? `${roi.toFixed(0)}%` : "—"}
        </div>
        <ProgressBar className="mt-3 h-3" value={Math.max(roi ?? 0, 0)} max={100} tone={roi === null ? "indigo" : roi >= 40 ? "green" : roi >= 20 ? "amber" : "red"} />
        <div className="mt-2 text-xs text-muted">beneficio anual ÷ inversión total × 100</div>
      </Card>
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {eur("entry_fee", "Canon de entrada")}
          {eur("investment", "Inversión inicial (total)", "Incluye canon de entrada")}
          {eur("own_capital", "Capital propio recomendado")}
          {eur("working_capital", "Capital circulante")}
          {eur("revenue", "Facturación media (anual)")}
          {eur("profit", "Beneficio operativo (anual)")}
          {pc("margin_pct", "Margen operativo", margin)}
          {pc("roi_pct", "ROI", roi)}
          {pc("royalty_pct", "Royalty")}
          {pc("ad_fee_pct", "Canon de publicidad")}
          {eur("other_costs", "Otros costes", "Anuales")}
          {eur("rent", "Alquiler estimado", "Mensual")}
          <Field label="Personal necesario"><NumberInput suffix="personas" value={f.staff} onChange={(v) => setFin("staff", v)} /></Field>
          <Field label="Break-even"><NumberInput suffix="meses" value={f.breakeven_months} onChange={(v) => setFin("breakeven_months", v)} /></Field>
          <Field label="Payback" hint={payback != null && !f.payback_months ? `Auto: ${payback.toFixed(0)} meses` : undefined}>
            <NumberInput suffix="meses" value={f.payback_months} onChange={(v) => setFin("payback_months", v)} placeholder={payback != null ? payback.toFixed(0) : undefined} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

function StepQuestions({ d, set }: { d: Draft; set: SetFn }) {
  const setAns = (a: Draft["answers"][string]) => set("answers", { ...d.answers, [a.question_id]: a });
  const countDone = (ids: string[]) => ids.filter((i) => d.answers[i]?.status === "answered").length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">❓ Preguntas</h2>
      <Card className="border-orange-200 bg-orange-50/40 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-semibold">Preguntas críticas</h3>
          <span className="text-xs text-muted">{countDone(CRITICAL_QUESTIONS.map((q) => q.id))}/{CRITICAL_QUESTIONS.length}</span>
        </div>
        <div className="divide-y divide-orange-100">
          {CRITICAL_QUESTIONS.map((q) => (
            <QuestionRow key={q.id} q={q} value={d.answers[q.id]} onChange={setAns} highlight />
          ))}
        </div>
      </Card>

      {QUESTION_GROUPS.map((g) => (
        <details key={g.category} className="group rounded-2xl border border-border bg-card">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold">
            {g.category}
            <span className="text-xs font-normal text-muted">
              {countDone(g.questions.map((q) => q.id))}/{g.questions.length}
            </span>
          </summary>
          <div className="divide-y divide-border border-t border-border px-4">
            {g.questions.map((q) => (
              <QuestionRow key={q.id} q={q} value={d.answers[q.id]} onChange={setAns} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function StepEvaluation({ d, set }: { d: Draft; set: SetFn }) {
  const score = computeScore(d.ratings);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">⭐ Evaluación</h2>
      <ScoreSummary score={score} />
      <Card className="divide-y divide-border px-4">
        {CRITERIA.map((c) => (
          <div key={c.key} className="py-4">
            <div className="flex items-baseline justify-between">
              <div className="font-medium">{c.emoji} {c.label}</div>
              <div className="text-xs text-muted">{c.weight}%</div>
            </div>
            {"hint" in c && <div className="text-xs text-muted">{c.hint}</div>}
            <Stars
              className="mt-1"
              size={40}
              value={d.ratings[c.key] ?? 0}
              onChange={(v) => set("ratings", { ...d.ratings, [c.key]: v || undefined })}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="font-semibold">🚩 Red Flags</h3>
        <FlagsEditor value={d.red_flags} onChange={(v) => set("red_flags", v)} presets={RED_FLAG_PRESETS} tone="red" placeholder="Añadir red flag…" />
      </Card>
      <Card className="space-y-3 p-4">
        <h3 className="font-semibold">🟢 Green Flags</h3>
        <FlagsEditor value={d.green_flags} onChange={(v) => set("green_flags", v)} presets={GREEN_FLAG_PRESETS} tone="green" placeholder="Añadir green flag…" />
      </Card>
      <Card className="space-y-3 p-4">
        <h3 className="font-semibold">📝 Mi impresión</h3>
        <Textarea
          className="min-h-36"
          value={d.impression}
          onChange={(e) => set("impression", e.target.value)}
          placeholder="Me gustó mucho el modelo. El fundador parece transparente. Tengo dudas sobre el coste de adquisición de clientes…"
        />
      </Card>
      <Card className="p-4">
        <Field label="Estado">
          <Select value={d.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
          </Select>
        </Field>
      </Card>
    </div>
  );
}
