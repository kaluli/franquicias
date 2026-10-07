import { CRITERIA, type CriterionKey } from "./catalog";

export type Ratings = Partial<Record<CriterionKey, number>>;

/**
 * Score 0–100 = Σ(peso × estrellas/5). Si faltan criterios por puntuar
 * (p. ej. en Modo Feria sólo se puntúan dos), se normaliza sobre los pesos
 * puntuados para no penalizar lo que aún no se ha evaluado.
 * Devuelve null si no hay ninguna puntuación.
 */
export function computeScore(ratings: Ratings): number | null {
  let weighted = 0;
  let weights = 0;
  for (const c of CRITERIA) {
    const stars = ratings[c.key];
    if (!stars) continue;
    weighted += c.weight * (stars / 5);
    weights += c.weight;
  }
  if (weights === 0) return null;
  return Math.round((weighted / weights) * 100);
}

export type Verdict = {
  label: string;
  emoji: string;
  tone: "emerald" | "green" | "amber" | "orange" | "red";
};

export function classify(score: number | null): Verdict | null {
  if (score === null) return null;
  if (score >= 90) return { label: "Excelente", emoji: "🟢", tone: "emerald" };
  if (score >= 80) return { label: "Muy interesante", emoji: "🟢", tone: "green" };
  if (score >= 70) return { label: "Analizar", emoji: "🟡", tone: "amber" };
  if (score >= 60) return { label: "Dudosa", emoji: "🟠", tone: "orange" };
  return { label: "Descartar", emoji: "🔴", tone: "red" };
}

export function scoreToStars(score: number | null): number {
  return score === null ? 0 : Math.round(score / 20);
}
