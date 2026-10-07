"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui";

export function FlagsEditor({
  value,
  onChange,
  presets,
  tone,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  presets: string[];
  tone: "red" | "green";
  placeholder: string;
}) {
  const [text, setText] = useState("");
  const selected = tone === "red" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const add = (raw: string) => {
    const items = raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const i of items) if (!next.some((n) => n.toLowerCase() === i.toLowerCase())) next.push(i);
    onChange(next);
    setText("");
  };
  const toggle = (p: string) => (value.includes(p) ? onChange(value.filter((v) => v !== p)) : onChange([...value, p]));
  const custom = value.filter((v) => !presets.includes(v));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={cn(
              "min-h-10 rounded-full border px-3.5 text-sm font-medium transition active:scale-95",
              value.includes(p) ? selected : "border-border bg-white text-zinc-600",
            )}
          >
            {p}
          </button>
        ))}
        {custom.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            className={cn("flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium", selected)}
          >
            {c} <X className="size-3.5" />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (text.trim()) add(text);
            }
          }}
        />
        <button
          type="button"
          onClick={() => text.trim() && add(text)}
          aria-label="Añadir"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-white active:scale-95"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
