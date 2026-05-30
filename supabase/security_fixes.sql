-- ============================================================
-- Security fixes
-- Run once in the Supabase SQL editor.
-- ============================================================


-- ============================================================
-- FIX 1: Prevent privilege escalation + lock sensitive columns
--
-- The old "Members update own profile" policy allowed updating
-- ANY column, including is_admin, slug, email, user_id, listed_at.
-- The new policy locks those down while still allowing members
-- to update bio, location, social, visibility, and avatar.
-- ============================================================

drop policy if exists "Members update own profile" on members;

create policy "Members update own profile"
  on members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    -- Cannot escalate to admin
    and is_admin          = (select is_admin  from public.members m where m.id = members.id)
    -- Cannot change slug (breaks profile URLs)
    and slug              = (select slug      from public.members m where m.id = members.id)
    -- Cannot change email (admin-managed)
    and email             is not distinct from (select email    from public.members m where m.id = members.id)
    -- Cannot change user_id (prevent account hijacking)
    and user_id           is not distinct from (select user_id  from public.members m where m.id = members.id)
    -- Cannot directly set listed_at — use bump_listed_at() RPC instead
    and listed_at         is not distinct from (select listed_at from public.members m where m.id = members.id)
  );


-- ============================================================
-- FIX 2: Move listed_at cooldown to the database
--
-- Previously the 7-day cooldown was only enforced in app code,
-- so anyone could bypass it with a direct API call.
-- This security-definer function owns the cooldown logic.
-- ============================================================

create or replace function public.bump_listed_at()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.members
  set listed_at = now()
  where user_id = auth.uid()
    and (listed_at is null or listed_at < now() - interval '7 days');
end;
$$;


-- ============================================================
-- FIX 3: Prevent members from giving feedback on their own projects
-- ============================================================

drop policy if exists "Members can submit feedback" on feedback;

create policy "Members can submit feedback"
  on feedback for insert
  to authenticated
  with check (
    -- Must be submitting as yourself
    from_member_id in (select id from members where user_id = auth.uid())
    -- Project must be seeking feedback
    and exists (
      select 1 from projects where id = project_id and seeking_feedback = true
    )
    -- Cannot give feedback on your own project
    and not exists (
      select 1 from projects p
      join members m on m.id = p.member_id
      where p.id = project_id and m.user_id = auth.uid()
    )
  );


-- ============================================================
-- FIX 4: Restrict avatar uploads to image file types only
-- ============================================================

drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'gif', 'webp', 'avif')
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'gif', 'webp', 'avif')
  );
