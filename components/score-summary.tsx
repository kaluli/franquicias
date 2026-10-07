import { classify, scoreToStars } from "@/lib/score";
import { Card, ProgressBar, Stars, VerdictBadge, scoreTone } from "./ui";

export function ScoreSummary({ score }: { score: number | null }) {
  const v = classify(score);
  return (
    <Card className="p-5 text-center">
      <div className="text-5xl font-semibold tracking-tight tabular-nums">
        {score ?? "—"}
        <span className="text-xl font-normal text-muted"> / 100</span>
      </div>
      <div className="mt-3 flex justify-center"><Stars value={scoreToStars(score)} size={28} /></div>
      <ProgressBar className="mt-4 h-3" value={score ?? 0} tone={scoreTone(score)} />
      <div className="mt-3 flex justify-center">
        <VerdictBadge score={score} className="px-3 py-1.5 text-sm" />
      </div>
      {!v && <p className="mt-2 text-sm text-muted">Puntúa los criterios para ver el score.</p>}
    </Card>
  );
}
