# Franchise Evaluator

Web mobile-first (Next.js + TypeScript + Tailwind + Neon Postgres) para evaluar franquicias en una feria.
Sin instalación: se usa desde el navegador mediante una URL.

## Puesta en marcha (≈5 min)

1. **Neon**: en tu proyecto, abre *SQL Editor*, pega [`db/schema.sql`](db/schema.sql) y pulsa **Run**
   (crea `franchises`, `financials`, `questions`, `answers`, `ratings`, `followups` y el catálogo de preguntas).
2. Copia `.env.example` a `.env.local` y rellena:
   - `DATABASE_URL`: connection string de Neon (*Connect*).
   - `APP_PASSWORD`: la contraseña con la que entrarás a la web.
   - `SESSION_SECRET`: genera una con `openssl rand -hex 32`.
3. `npm install && npm run dev` → <http://localhost:3000> (entras sólo con la contraseña).

## Desplegar en Vercel

Sube el repo a GitHub → *Import project* en Vercel → añade las tres variables de entorno → Deploy.

## Flujo

Dashboard → **⚡ Modo Feria** → Guardar → vuelve al dashboard. En casa: ranking, filtros, comparador, edición completa.

## Score

`Score = Σ peso × estrellas/5` con pesos: Rentabilidad 20, Crecimiento 15, Independencia 15, Recurrencia 10,
Central 10, Riesgo 15, Salida 5, Encaje 10. Si sólo has puntuado algunos criterios (Modo Feria puntúa 2),
se normaliza sobre los pesos puntuados. Lógica en [`lib/score.ts`](lib/score.ts).

ROI = beneficio anual ÷ inversión inicial × 100 (se puede sobrescribir a mano).

## Notas

- Exportar CSV desde el dashboard; PDF vía *Imprimir → Guardar como PDF* en el detalle de cada franquicia.
- Next.js 16: el antiguo `middleware` ahora es `proxy.ts` (protege todas las rutas salvo `/login`).
- Los datos se leen/escriben con Server Actions (`lib/actions.ts`); la `DATABASE_URL` nunca llega al navegador.
