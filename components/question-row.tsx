"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ANSWER_STATUSES, type QuestionDef } from "@/lib/catalog";
import type { Answer } from "@/lib/types";
import { Input, Textarea } from "./ui";

const blank = (id: string): Answer => ({ question_id: id, answer: "", status: "not_asked", notes: "" });

export function QuestionRow({
  q,
  value,
  onChange,
  highlight,
}: {
  q: QuestionDef;
  value: Answer | undefined;
  onChange: (a: Answer) => void;
  highlight?: boolean;
}) {
  const a = value ?? blank(q.id);
  const [showNotes, setShowNotes] = useState(Boolean(a.notes));

  return (
    <div className={cn("space-y-2.5 py-4", highlight && "py-3.5")}>
      <div className="text-[15px] font-medium leading-snug">
        {highlight && "🔥 "}
        {q.text}
      </div>
      <Input
        value={a.answer}
        placeholder="Respuesta"
        onChange={(e) =>
          onChange({ ...a, answer: e.target.value, status: a.status === "not_asked" && e.target.value ? "answered" : a.status })
        }
      />
      <div className="grid grid-cols-3 gap-1.5">
        {ANSWER_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...a, status: s.value })}
            className={cn(
              "min-h-11 rounded-lg border px-1 text-xs font-medium leading-tight transition active:scale-95",
              a.status === s.value
                ? s.value === "answered"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : s.value === "unknown"
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700"
                : "border-border bg-white text-zinc-500",
            )}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
      {showNotes ? (
        <Textarea
          className="min-h-16"
          placeholder="Notas"
          value={a.notes}
          onChange={(e) => onChange({ ...a, notes: e.target.value })}
        />
      ) : (
        <button type="button" onClick={() => setShowNotes(true)} className="text-xs font-medium text-accent">
          + Añadir nota
        </button>
      )}
    </div>
  );
}
