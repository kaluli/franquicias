import Link from "next/link";
import { categoryOf, statusOf } from "@/lib/catalog";
import { eurShort, pct } from "@/lib/format";
import { roiOf } from "@/lib/metrics";
import { scoreToStars } from "@/lib/score";
import type { Franchise } from "@/lib/types";
import { Badge, Card, Stars, VerdictBadge } from "./ui";

export function FranchiseCard({ f, rank }: { f: Franchise; rank?: number }) {
  const cat = categoryOf(f.category);
  const fin = f.financials;
  const st = statusOf(f.status);
  const metrics = [
    { v: eurShort(fin?.investment), l: "inversión" },
    { v: eurShort(fin?.profit), l: "beneficio" },
    { v: pct(roiOf(f)), l: "ROI" },
    { v: fin?.breakeven_months != null ? `${Math.round(fin.breakeven_months)} m` : "—", l: "break-even" },
  ];
  return (
    <Link href={`/f/${f.id}`} className="block">
      <Card className="p-4 transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted">
              {rank !== undefined && <span className="font-semibold tabular-nums">#{rank}</span>}
              <span>{cat ? `${cat.emoji} ${cat.label}` : "Sin categoría"}</span>
            </div>
            <h3 className="mt-0.5 truncate text-lg font-semibold tracking-tight">{f.name}</h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-semibold leading-none tracking-tight tabular-nums">
              {f.score ?? "—"}
              <span className="text-sm font-normal text-muted">/100</span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Stars value={scoreToStars(f.score)} size={18} />
          <div className="flex gap-1.5">
            <Badge>{st.emoji} {st.label}</Badge>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3">
          {metrics.map((m) => (
            <div key={m.l}>
              <div className="text-sm font-semibold tabular-nums">{m.v}</div>
              <div className="text-[11px] text-muted">{m.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <VerdictBadge score={f.score} />
        </div>
      </Card>
    </Link>
  );
}
