// Ejecuta db/schema.sql contra DATABASE_URL (de .env.local). Uso: npm run db:setup
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.DATABASE_URL) throw new Error("Pega tu DATABASE_URL en .env.local");
const pool = new Pool({ connectionString: env.DATABASE_URL });
await pool.query(readFileSync("db/schema.sql", "utf8"));
const { rows } = await pool.query("select count(*)::int as n from questions");
console.log(`✓ Esquema aplicado. Preguntas cargadas: ${rows[0].n}`);
await pool.end();
