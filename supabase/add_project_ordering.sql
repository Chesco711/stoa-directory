-- ============================================================
-- Add position ordering to projects
-- Run once in the Supabase SQL editor.
-- ============================================================

alter table projects add column if not exists position integer default 0;

-- Initialise positions in created_at order within each member's projects
update projects p
set position = sub.rn
from (
  select id,
         row_number() over (partition by member_id order by created_at) - 1 as rn
  from projects
) sub
where p.id = sub.id;
