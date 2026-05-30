-- ============================================================
-- Migrate project status from 3 values → 2 values
-- active + shipped → live   |   wip stays wip
-- Run once in the Supabase SQL editor.
-- ============================================================

-- 1. Drop the old constraint FIRST (before writing any new values)
alter table projects
  drop constraint if exists projects_status_check;

-- 2. Migrate existing rows (now unconstrained, so 'live' is accepted)
update projects
set status = 'live'
where status in ('active', 'shipped');

-- 3. Add the new constraint
alter table projects
  add constraint projects_status_check
  check (status in ('wip', 'live'));

-- 4. Update the column default
alter table projects
  alter column status set default 'live';
