-- ============================================================
-- Add listed_at for directory ordering with anti-gaming cooldown
-- Run once in the Supabase SQL editor.
-- ============================================================

alter table members add column if not exists listed_at timestamptz default now();

-- Initialise to created_at so existing members have a sensible baseline
update members set listed_at = created_at;
