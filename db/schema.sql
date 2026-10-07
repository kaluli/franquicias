-- Franchise Evaluator — esquema Postgres (Neon)
-- Ejecuta este archivo completo en Neon → SQL Editor → Run.
-- Es idempotente: puedes volver a ejecutarlo sin perder datos.

create extension if not exists "pgcrypto";

-- ───────────── Tablas ─────────────

create table if not exists franchises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  contact_name text,
  email text,
  phone text,
  website text,
  location text,
  visit_date date,
  status text not null default 'analizar'
    check (status in ('interesante','analizar','finalista','negociando','descartada')),
  red_flags text[] not null default '{}',
  green_flags text[] not null default '{}',
  impression text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists financials (
  franchise_id uuid primary key references franchises(id) on delete cascade,
  entry_fee numeric,
  investment numeric,
  own_capital numeric,
  revenue numeric,
  profit numeric,
  margin_pct numeric,
  royalty_pct numeric,
  ad_fee_pct numeric,
  other_costs numeric,
  rent numeric,
  staff numeric,
  working_capital numeric,
  breakeven_months numeric,
  roi_pct numeric,
  payback_months numeric
);

create table if not exists questions (
  id text primary key,
  category text not null,
  text text not null,
  sort int not null default 0,
  critical boolean not null default false
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references franchises(id) on delete cascade,
  question_id text not null references questions(id) on delete cascade,
  answer text not null default '',
  status text not null default 'not_asked'
    check (status in ('answered','not_asked','unknown')),
  notes text not null default '',
  unique (franchise_id, question_id)
);

create table if not exists ratings (
  franchise_id uuid not null references franchises(id) on delete cascade,
  criterion text not null
    check (criterion in ('rentabilidad','crecimiento','independencia','recurrencia','central','riesgo','salida','encaje')),
  stars int not null check (stars between 1 and 5),
  primary key (franchise_id, criterion)
);

create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references franchises(id) on delete cascade,
  note text not null,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists answers_franchise_idx on answers(franchise_id);
create index if not exists followups_franchise_idx on followups(franchise_id);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists franchises_updated_at on franchises;
create trigger franchises_updated_at before update on franchises
  for each row execute function set_updated_at();

-- ───────────── Catálogo de preguntas ─────────────
insert into questions (id, category, text, sort, critical) values
  ('crit-1', 'Críticas', '¿Cuál es la inversión total REAL?', 0, true),
  ('crit-2', 'Críticas', '¿Cuál es la facturación media?', 1, true),
  ('crit-3', 'Críticas', '¿Cuál es el beneficio operativo?', 2, true),
  ('crit-4', 'Críticas', '¿Cuál es el ROI?', 3, true),
  ('crit-5', 'Críticas', '¿Cuánto tarda el break-even?', 4, true),
  ('crit-6', 'Críticas', '¿Cuántas horas trabaja el propietario?', 5, true),
  ('crit-7', 'Críticas', '¿Puede funcionar con un encargado?', 6, true),
  ('crit-8', 'Críticas', '¿Cuántas franquicias han cerrado?', 7, true),
  ('crit-9', 'Críticas', '¿Puedo hablar con 3 franquiciados actuales?', 8, true),
  ('crit-10', 'Críticas', '¿Puedo ver números reales de una unidad?', 9, true),
  ('crit-11', 'Críticas', '¿Por qué debería pagar por esta franquicia en lugar de montar este mismo negocio yo sola?', 10, true),
  ('inv-1', 'Inversión', '¿Cuál es la inversión total REAL?', 11, false),
  ('inv-2', 'Inversión', '¿Cuánto capital propio recomiendan?', 12, false),
  ('inv-3', 'Inversión', '¿Qué costes adicionales existen?', 13, false),
  ('inv-4', 'Inversión', '¿Existe capital circulante recomendado?', 14, false),
  ('inv-5', 'Inversión', '¿Hay costes ocultos?', 15, false),
  ('ren-1', 'Rentabilidad', '¿Cuál es la facturación media de una unidad madura?', 16, false),
  ('ren-2', 'Rentabilidad', '¿Cuál es el beneficio operativo medio?', 17, false),
  ('ren-3', 'Rentabilidad', '¿Cuál es el margen operativo?', 18, false),
  ('ren-4', 'Rentabilidad', '¿Cuánto tarda en llegar al break-even?', 19, false),
  ('ren-5', 'Rentabilidad', '¿Cuál es el ROI habitual?', 20, false),
  ('ren-6', 'Rentabilidad', '¿Cuánto tarda en recuperarse la inversión?', 21, false),
  ('ren-7', 'Rentabilidad', '¿Cuántas horas semanales trabaja el propietario?', 22, false),
  ('neg-1', 'Modelo de negocio', '¿Cuál es el cliente objetivo?', 23, false),
  ('neg-2', 'Modelo de negocio', '¿Cuál es el ticket medio?', 24, false),
  ('neg-3', 'Modelo de negocio', '¿Qué porcentaje de ventas son recurrentes?', 25, false),
  ('neg-4', 'Modelo de negocio', '¿Cuál es la tasa de repetición?', 26, false),
  ('neg-5', 'Modelo de negocio', '¿Cómo consiguen clientes?', 27, false),
  ('neg-6', 'Modelo de negocio', '¿Qué porcentaje viene del marketing de la central?', 28, false),
  ('neg-7', 'Modelo de negocio', '¿Cuál es el principal competidor?', 29, false),
  ('neg-8', 'Modelo de negocio', '¿Cuál es vuestra ventaja frente a montar el negocio independientemente?', 30, false),
  ('cen-1', 'Central', '¿Cuántos franquiciados tienen?', 31, false),
  ('cen-2', 'Central', '¿Cuántas unidades propias tienen?', 32, false),
  ('cen-3', 'Central', '¿Cuántas franquicias han cerrado en los últimos 3 años?', 33, false),
  ('cen-4', 'Central', '¿Por qué cerraron?', 34, false),
  ('cen-5', 'Central', '¿Cuántos franquiciados tienen más de una unidad?', 35, false),
  ('cen-6', 'Central', '¿Cuál es el porcentaje de renovación?', 36, false),
  ('cen-7', 'Central', '¿Cuánto tiempo lleva funcionando la empresa?', 37, false),
  ('cen-8', 'Central', '¿Cuánto tiempo lleva franquiciando?', 38, false),
  ('cos-1', 'Costes', '¿Qué royalty cobran?', 39, false),
  ('cos-2', 'Costes', '¿Qué canon de publicidad cobran?', 40, false),
  ('cos-3', 'Costes', '¿Qué otros fees existen?', 41, false),
  ('cos-4', 'Costes', '¿Qué proveedores son obligatorios?', 42, false),
  ('cos-5', 'Costes', '¿Puedo negociar proveedores?', 43, false),
  ('cos-6', 'Costes', '¿Hay compras mínimas obligatorias?', 44, false),
  ('ter-1', 'Territorio', '¿Existe exclusividad territorial?', 45, false),
  ('ter-2', 'Territorio', '¿Cuál es el radio?', 46, false),
  ('ter-3', 'Territorio', '¿Pueden abrir otra unidad cerca?', 47, false),
  ('ter-4', 'Territorio', '¿Cómo se determina la zona protegida?', 48, false),
  ('sop-1', 'Soporte', '¿Qué formación inicial ofrecen?', 49, false),
  ('sop-2', 'Soporte', '¿Cuánto dura?', 50, false),
  ('sop-3', 'Soporte', '¿Qué formación continua ofrecen?', 51, false),
  ('sop-4', 'Soporte', '¿Qué soporte de marketing proporcionan?', 52, false),
  ('sop-5', 'Soporte', '¿Qué soporte operativo proporcionan?', 53, false),
  ('sop-6', 'Soporte', '¿Cuántas personas tiene el equipo de soporte?', 54, false),
  ('rie-1', 'Riesgo', '¿Cuál es el mayor problema actual de los franquiciados?', 55, false),
  ('rie-2', 'Riesgo', '¿Cuál es el perfil de franquiciado que NO funciona?', 56, false),
  ('rie-3', 'Riesgo', '¿Cuál ha sido la última franquicia que cerró?', 57, false),
  ('rie-4', 'Riesgo', '¿Por qué cerró?', 58, false),
  ('rie-5', 'Riesgo', '¿Cuál es la unidad que menos factura?', 59, false),
  ('rie-6', 'Riesgo', '¿Por qué factura tan poco?', 60, false),
  ('rie-7', 'Riesgo', '¿Qué porcentaje de franquiciados no renueva?', 61, false),
  ('sal-1', 'Salida', '¿Puedo vender o traspasar la franquicia?', 62, false),
  ('sal-2', 'Salida', '¿Cuánto cuesta?', 63, false),
  ('sal-3', 'Salida', '¿La central debe aprobar al comprador?', 64, false),
  ('sal-4', 'Salida', '¿Existe penalización por salida anticipada?', 65, false),
  ('sal-5', 'Salida', '¿Qué ocurre cuando termina el contrato?', 66, false),
  ('sal-6', 'Salida', '¿Cuánto cuesta renovar?', 67, false)
on conflict (id) do update set category = excluded.category, text = excluded.text, sort = excluded.sort, critical = excluded.critical;
