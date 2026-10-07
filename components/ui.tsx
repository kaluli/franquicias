"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { classify, type Verdict } from "@/lib/score";

// ───────── Button ─────────

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
        size === "md" ? "h-12 px-5 text-[15px]" : "h-14 px-6 text-base",
        variant === "primary" && "bg-accent text-white shadow-sm hover:bg-indigo-600",
        variant === "dark" && "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800",
        variant === "secondary" && "bg-white text-zinc-900 border border-border hover:bg-zinc-50",
        variant === "ghost" && "text-zinc-600 hover:bg-zinc-100",
        variant === "danger" && "bg-white text-red-600 border border-red-200 hover:bg-red-50",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

// ───────── Card ─────────

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]", className)}
      {...props}
    />
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold tracking-tight", className)}>{children}</h2>;
}

// ───────── Form ─────────

const inputBase =
  "w-full rounded-xl border border-border bg-white px-4 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-accent focus:ring-4 focus:ring-indigo-100";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, "h-12", className)} {...props} />
  ),
);
Input.displayName = "Input";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, "py-3 min-h-24", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputBase, "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2371717a%22 stroke-width=%222%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10", className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Input numérico con prefijo/sufijo (€, %, meses) */
export function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{prefix}</span>
      )}
      <Input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ""))}
        className={cn(prefix && "pl-9", suffix && "pr-16", className)}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ───────── Badge / Chip ─────────

const tones: Record<Verdict["tone"] | "zinc" | "indigo", string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export function Badge({
  tone = "zinc",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VerdictBadge({ score, className }: { score: number | null; className?: string }) {
  const v = classify(score);
  if (!v) return <Badge className={className}>Sin evaluar</Badge>;
  return (
    <Badge tone={v.tone} className={className}>
      {v.emoji} {v.label}
    </Badge>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-95",
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-border bg-white text-zinc-700 hover:bg-zinc-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ───────── Stars ─────────

export function Stars({
  value,
  onChange,
  size = 36,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} role={onChange ? "radiogroup" : "img"} aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            width={size}
            height={size}
            className={cn(
              "transition",
              filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300",
            )}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={filled}
            aria-label={`${n} estrellas`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="-m-0.5 rounded-lg p-1 active:scale-90"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}

// ───────── Progress ─────────

export function ProgressBar({
  value,
  max = 100,
  tone = "indigo",
  className,
}: {
  value: number;
  max?: number;
  tone?: "indigo" | "green" | "amber" | "red";
  className?: string;
}) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  const bar = { indigo: "bg-accent", green: "bg-emerald-500", amber: "bg-amber-400", red: "bg-red-500" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-zinc-100", className)}>
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${w}%` }} />
    </div>
  );
}

export function scoreTone(score: number | null): "indigo" | "green" | "amber" | "red" {
  if (score === null) return "indigo";
  if (score >= 80) return "green";
  if (score >= 70) return "amber";
  if (score >= 60) return "amber";
  return "red";
}

export function Stat({ value, label, className }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Card>
  );
}

export function Spinner() {
  return <div className="mx-auto my-16 size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-accent" />;
}

export function ErrorBox({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : (error as { message?: string })?.message ?? String(error);
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <b>Algo ha fallado:</b> {msg}
    </div>
  );
}
