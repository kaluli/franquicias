// Mensaje que sobrevive a una navegación (p. ej. "Franquicia guardada ✓")
const KEY = "flash";

export function setFlash(msg: string) {
  try {
    sessionStorage.setItem(KEY, msg);
  } catch {}
}

export function takeFlash(): string | null {
  try {
    const m = sessionStorage.getItem(KEY);
    if (m) sessionStorage.removeItem(KEY);
    return m;
  } catch {
    return null;
  }
}
