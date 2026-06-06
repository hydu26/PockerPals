-- ============================================================
-- Cập nhật RLS: thay hardcoded email bằng app_metadata.role
-- Chạy trên DB đã có sẵn (production).
--
-- Super admin cần được set trong Supabase Dashboard:
--   Authentication → Users → Edit user → app_metadata = {"role": "admin"}
-- ============================================================

-- ── groups ──────────────────────────────────────────────────

drop policy if exists "groups: admin insert"      on public.groups;
drop policy if exists "groups: admin update"      on public.groups;
drop policy if exists "groups: super admin delete" on public.groups;

create policy "groups: admin insert"
  on public.groups for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'leader')
  );

create policy "groups: admin update"
  on public.groups for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from public.group_admins
      where group_id = groups.id
        and email = auth.jwt() ->> 'email'
    )
  );

create policy "groups: super admin delete"
  on public.groups for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── members ─────────────────────────────────────────────────

drop policy if exists "members: admin write" on public.members;

create policy "members: admin write"
  on public.members for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from public.group_admins
      where group_id = members.group_id
        and email = auth.jwt() ->> 'email'
    )
  );

-- ── group_admins ─────────────────────────────────────────────

drop policy if exists "group_admins: read"              on public.group_admins;
drop policy if exists "group_admins: insert"            on public.group_admins;
drop policy if exists "group_admins: super admin delete" on public.group_admins;

create policy "group_admins: read"
  on public.group_admins for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or email = auth.jwt() ->> 'email'
  );

create policy "group_admins: insert"
  on public.group_admins for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or email = auth.jwt() ->> 'email'
  );

create policy "group_admins: super admin delete"
  on public.group_admins for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── sessions ────────────────────────────────────────────────

drop policy if exists "sessions: admin write" on public.sessions;

create policy "sessions: admin write"
  on public.sessions for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from public.group_admins
      where group_id = sessions.group_id
        and email = auth.jwt() ->> 'email'
    )
  );
