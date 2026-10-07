// Sesión de un solo usuario: cookie firmada con HMAC (Web Crypto, vale en proxy y en Node).
export const COOKIE = "fe_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const enc = new TextEncoder();

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${exp}.${await sign(String(exp))}`;
}

export async function verifyToken(token: string | undefined) {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await sign(exp);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export const SESSION_MAX_AGE = MAX_AGE;
