"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./session";
import { CRITERIA } from "./catalog";
import type { Answer, Followup } from "./types";

const FIN = [
  "entry_fee", "investment", "own_capital", "revenue", "profit", "margin_pct", "royalty_pct",
  "ad_fee_pct", "other_costs", "rent", "staff", "working_capital", "breakeven_months",
  "roi_pct", "payback_months",
] as const;

function db() {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL en las variables de entorno.");
  return neon(process.env.DATABASE_URL);
}

async function guard() {
  if (!(await verifyToken((await cookies()).get(COOKIE)?.value))) throw new Error("No autorizado");
}

// Franquicia + financials + ratings como un único JSON (fechas como texto)
const SELECT = `
  select to_jsonb(f) || jsonb_build_object(
    'financials', (select to_jsonb(x) from financials x where x.franchise_id = f.id),
    'ratings', coalesce((select jsonb_agg(jsonb_build_object('criterion', r.criterion, 'stars', r.stars))
                         from ratings r where r.franchise_id = f.id), '[]'::jsonb)
  ) as j from franchises f`;

export async function listFranchisesAction() {
  await guard();
  const rows = await db().query(`${SELECT} order by f.created_at desc`);
  return rows.map((r) => r.j);
}

export async function getFranchiseAction(id: string) {
  await guard();
  const sql = db();
  const [f, answers, followups] = await Promise.all([
    sql.query(`${SELECT} where f.id = $1`, [id]),
    sql.query(`select question_id, answer, status, notes from answers where franchise_id = $1`, [id]),
    sql.query(`select id, franchise_id, note, due_date::text as due_date, done, created_at::text as created_at
               from followups where franchise_id = $1 order by created_at`, [id]),
  ]);
  if (!f[0]) throw new Error("Franquicia no encontrada");
  return { raw: f[0].j, answers: answers as Answer[], followups: followups as Followup[] };
}

type SaveInput = {
  id?: string;
  row: Record<string, string | string[] | null>;
  fin: Record<string, number | null>;
  ratings: Record<string, number | undefined>;
  answers: Answer[];
};

export async function saveFranchiseAction(input: SaveInput): Promise<string> {
  await guard();
  const sql = db();
  const id = input.id ?? crypto.randomUUID();
  const r = input.row;

  const rated = CRITERIA.filter((c) => input.ratings[c.key]);
  const keep = input.answers;

  await sql.transaction([
    sql.query(
      `insert into franchises (id, name, category, contact_name, email, phone, website, location,
         visit_date, status, red_flags, green_flags, impression)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$10,$11::text[],$12::text[],$13)
       on conflict (id) do update set
         name=excluded.name, category=excluded.category, contact_name=excluded.contact_name,
         email=excluded.email, phone=excluded.phone, website=excluded.website,
         location=excluded.location, visit_date=excluded.visit_date, status=excluded.status,
         red_flags=excluded.red_flags, green_flags=excluded.green_flags,
         impression=excluded.impression`,
      [id, r.name, r.category, r.contact_name, r.email, r.phone, r.website, r.location,
       r.visit_date, r.status, r.red_flags, r.green_flags, r.impression],
    ),
    sql.query(
      `insert into financials (franchise_id, ${FIN.join(", ")})
       values ($1, ${FIN.map((_, i) => `$${i + 2}`).join(", ")})
       on conflict (franchise_id) do update set ${FIN.map((k) => `${k}=excluded.${k}`).join(", ")}`,
      [id, ...FIN.map((k) => input.fin[k] ?? null)],
    ),
    sql.query(`delete from ratings where franchise_id = $1 and not (criterion = any($2::text[]))`, [
      id, rated.map((c) => c.key),
    ]),
    sql.query(
      `insert into ratings (franchise_id, criterion, stars)
       select $1, c, s from unnest($2::text[], $3::int[]) as t(c, s)
       on conflict (franchise_id, criterion) do update set stars = excluded.stars`,
      [id, rated.map((c) => c.key), rated.map((c) => input.ratings[c.key]!)],
    ),
    sql.query(`delete from answers where franchise_id = $1 and not (question_id = any($2::text[]))`, [
      id, keep.map((a) => a.question_id),
    ]),
    sql.query(
      `insert into answers (franchise_id, question_id, answer, status, notes)
       select $1, q, a, s, n from unnest($2::text[], $3::text[], $4::text[], $5::text[]) as t(q, a, s, n)
       on conflict (franchise_id, question_id) do update
         set answer = excluded.answer, status = excluded.status, notes = excluded.notes`,
      [id, keep.map((a) => a.question_id), keep.map((a) => a.answer), keep.map((a) => a.status), keep.map((a) => a.notes)],
    ),
  ]);
  return id;
}

export async function setStatusAction(id: string, status: string) {
  await guard();
  await db().query(`update franchises set status = $2 where id = $1`, [id, status]);
}

export async function deleteFranchiseAction(id: string) {
  await guard();
  await db().query(`delete from franchises where id = $1`, [id]);
}

export async function addFollowupAction(franchiseId: string, note: string, due: string | null) {
  await guard();
  const rows = await db().query(
    `insert into followups (franchise_id, note, due_date) values ($1, $2, $3::date)
     returning id, franchise_id, note, due_date::text as due_date, done, created_at::text as created_at`,
    [franchiseId, note, due],
  );
  return rows[0] as Followup;
}

export async function setFollowupDoneAction(id: string, done: boolean) {
  await guard();
  await db().query(`update followups set done = $2 where id = $1`, [id, done]);
}

export async function deleteFollowupAction(id: string) {
  await guard();
  await db().query(`delete from followups where id = $1`, [id]);
}
