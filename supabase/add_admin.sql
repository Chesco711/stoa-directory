-- ============================================================
-- Stoa Member Project Directory — Admin role & policies
-- Run this once in the Supabase SQL editor
-- ============================================================

-- 1. Add is_admin column
alter table members add column if not exists is_admin boolean default false;

-- 2. Grant admin to Arthur Fox
update members set is_admin = true where slug = 'arthur-fox';

-- ============================================================
-- 3. RLS: admins can do anything on members and projects
-- ============================================================

drop policy if exists "Admins can manage all members" on members;
create policy "Admins can manage all members"
  on members for all
  to authenticated
  using  (exists (select 1 from members where user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from members where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins can manage all projects" on projects;
create policy "Admins can manage all projects"
  on projects for all
  to authenticated
  using  (exists (select 1 from members where user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from members where user_id = auth.uid() and is_admin = true));
