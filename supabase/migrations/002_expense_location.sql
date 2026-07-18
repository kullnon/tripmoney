-- 002 · expenses.location varchar(80)
-- The column is ALREADY LIVE in project mytripmoney (rthpayyevlloxsbzfxuf) as
-- varchar(80) — it was applied out-of-band. This file exists only so the repo's
-- migration history matches the live schema. varchar(80) enforces the ≤80-char
-- limit at the type level, so no extra CHECK constraint is needed. Fully
-- idempotent: `supabase db push` (or a fresh apply) is a no-op when the column
-- already exists, and never fails with "column already exists".

alter table public.expenses
  add column if not exists location varchar(80);
