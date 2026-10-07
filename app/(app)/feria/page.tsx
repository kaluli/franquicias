"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CATEGORIES, GREEN_FLAG_PRESETS, RED_FLAG_PRESETS } from "@/lib/catalog";
import { emptyDraft, saveDraft, type Draft, type FinKey } from "@/lib/data";
import { setFlash } from "@/lib/flash";
import { FlagsEditor } from "@/components/flags-editor";
import { Button, ErrorBox, Input, NumberInput, Select, Stars, Textarea } from "@/components/ui";

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function FeriaPage() {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setFin = (k: FinKey, v: string) => setD((p) => ({ ...p, fin: { ...p.fin, [k]: v } }));

  const inv = parseFloat(d.fin.investment.replace(",", "."));
  const profit = parseFloat(d.fin.profit.replace(",", "."));
  const autoRoi = inv > 0 && Number.isFinite(profit) ? (profit / inv) * 100 : null;

  async function save() {
    if (!d.name.trim()) {
      setError(new Error("Pon al menos el nombre de la empresa."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveDraft(d);
      setFlash("Franquicia guardada ✓");
      router.push("/");
    } catch (e) {
      setError(e);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">⚡ Modo Feria</h1>
          <p className="text-sm text-muted">Menos de 2 minutos por empresa.</p>
        </div>
        <Link href="/nueva" className="text-sm font-medium text-accent">Formulario completo →</Link>
      </div>

      <Block n={1} title="Empresa">
        <div className="space-y-3">
          <Input placeholder="Nombre de la empresa" value={d.name} onChange={(e) => set("name", e.target.value)} autoFocus />
          <Select value={d.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Categoría…</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </Select>
        </div>
      </Block>

      <Block n={2} title="Inversión"><NumberInput prefix="€" value={d.fin.investment} onChange={(v) => setFin("investment", v)} placeholder="80000" /></Block>
      <Block n={3} title="Facturación anual"><NumberInput prefix="€" value={d.fin.revenue} onChange={(v) => setFin("revenue", v)} placeholder="250000" /></Block>
      <Block n={4} title="Beneficio"><NumberInput prefix="€" value={d.fin.profit} onChange={(v) => setFin("profit", v)} placeholder="42000" /></Block>
      <Block n={5} title="ROI">
        <NumberInput
          suffix="%"
          value={d.fin.roi_pct}
          onChange={(v) => setFin("roi_pct", v)}
          placeholder={autoRoi !== null ? autoRoi.toFixed(0) : "se calcula solo"}
        />
        {autoRoi !== null && !d.fin.roi_pct && (
          <p className="mt-2 text-sm text-muted">Calculado: <b className="text-zinc-900">{autoRoi.toFixed(0)}%</b> (beneficio ÷ inversión)</p>
        )}
      </Block>
      <Block n={6} title="Break-even"><NumberInput suffix="meses" value={d.fin.breakeven_months} onChange={(v) => setFin("breakeven_months", v)} placeholder="18" /></Block>

      <Block n={7} title="¿Puede funcionar sin mí?">
        <Stars value={d.ratings.independencia ?? 0} onChange={(v) => set("ratings", { ...d.ratings, independencia: v || undefined })} size={44} />
      </Block>
      <Block n={8} title="¿Me parece interesante?">
        <Stars value={d.ratings.encaje ?? 0} onChange={(v) => set("ratings", { ...d.ratings, encaje: v || undefined })} size={44} />
      </Block>

      <Block n={9} title="🚩 Red Flags">
        <FlagsEditor value={d.red_flags} onChange={(v) => set("red_flags", v)} presets={RED_FLAG_PRESETS} tone="red" placeholder="Otra red flag…" />
      </Block>
      <Block n={10} title="🟢 Green Flags">
        <FlagsEditor value={d.green_flags} onChange={(v) => set("green_flags", v)} presets={GREEN_FLAG_PRESETS} tone="green" placeholder="Otra green flag…" />
      </Block>
      <Block n={11} title="📝 Impresión">
        <Textarea value={d.impression} onChange={(e) => set("impression", e.target.value)} placeholder="¿Qué te pareció? ¿Dudas?" />
      </Block>

      {error ? <ErrorBox error={error} /> : null}

      <div className="sticky bottom-20 z-20 md:bottom-4">
        <Button size="lg" className="w-full shadow-lg" onClick={save} disabled={saving}>
          <Check className="size-5" /> {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
