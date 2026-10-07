const full = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function eur(n: number | null | undefined) {
  return n === null || n === undefined ? "—" : full.format(n);
}

export function eurShort(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (abs >= 1000) return `€${Math.round(n / 1000)}K`;
  return `€${Math.round(n)}`;
}

export function pct(n: number | null | undefined, digits = 0) {
  return n === null || n === undefined ? "—" : `${n.toFixed(digits)}%`;
}

export function months(n: number | null | undefined) {
  return n === null || n === undefined ? "—" : `${Math.round(n)} meses`;
}

export function dateEs(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
