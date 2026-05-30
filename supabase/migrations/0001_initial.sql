-- ============================================================
-- PokerPals — Complete Schema (consolidated)
-- ============================================================

-- Extension: bcrypt hashing
create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table public.groups (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  type          text        not null default 'standard',   -- 'standard' | 'tournament'
  loan_amount   integer     not null default 0,            -- đơn vị: nghìn đồng
  chips         jsonb       not null default '[]',         -- [{id, name, color, value}]
  password_hash text,                                      -- bcrypt hash, null = không có mật khẩu
  currency_unit text        not null default 'centime',    -- 'centime' | 'EUR'
  created_at    timestamptz not null default now(),
  created_by    text                                       -- email string
);

create table public.members (
  id        uuid    primary key default gen_random_uuid(),
  group_id  uuid    not null references public.groups(id) on delete cascade,
  name      text    not null,
  color     text    not null default '#a78bfa',
  position  integer not null default 0
);

create table public.group_admins (
  group_id  uuid  not null references public.groups(id) on delete cascade,
  email     text  not null,
  primary key (group_id, email)
);

create table public.sessions (
  id          uuid        primary key default gen_random_uuid(),
  group_id    uuid        not null references public.groups(id) on delete cascade,
  date        date        not null default current_date,
  scores      jsonb       not null default '{}',   -- {member_id: score_number}
  created_at  timestamptz not null default now(),
  created_by  text                                 -- email string
);

-- Login codes cho custom auth flow
create table public.login_codes (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  code       text        not null,
  expires_at timestamptz not null,
  used       boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_members_group      on public.members(group_id);
create index idx_admins_group       on public.group_admins(group_id);
create index idx_admins_email       on public.group_admins(email);
create index idx_sessions_group     on public.sessions(group_id);
create index idx_sessions_date      on public.sessions(group_id, date desc);
create index idx_login_codes_email  on public.login_codes(email);
create index idx_login_codes_expires on public.login_codes(expires_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.groups       enable row level security;
alter table public.members      enable row level security;
alter table public.group_admins enable row level security;
alter table public.sessions     enable row level security;
-- login_codes chỉ truy cập qua service_role trong API routes
alter table public.login_codes  disable row level security;

-- ──────────────────────────────────────────────────────────
-- groups
-- ──────────────────────────────────────────────────────────

create policy "groups: public read"
  on public.groups for select
  using (true);

create policy "groups: admin insert"
  on public.groups for insert
  with check (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or auth.jwt() ->> 'email' is not null
  );

create policy "groups: admin update"
  on public.groups for update
  using (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or exists (
      select 1 from public.group_admins
      where group_id = groups.id
        and email = auth.jwt() ->> 'email'
    )
  );

create policy "groups: super admin delete"
  on public.groups for delete
  using (auth.jwt() ->> 'email' = 'corneille261998@gmail.com');

-- ──────────────────────────────────────────────────────────
-- members
-- ──────────────────────────────────────────────────────────

create policy "members: public read"
  on public.members for select
  using (true);

create policy "members: admin write"
  on public.members for all
  using (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or exists (
      select 1 from public.group_admins
      where group_id = members.group_id
        and email = auth.jwt() ->> 'email'
    )
  );

-- ──────────────────────────────────────────────────────────
-- group_admins
-- Note: không dùng subquery tự tham chiếu → tránh infinite recursion
-- ──────────────────────────────────────────────────────────

create policy "group_admins: read"
  on public.group_admins for select
  using (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or email = auth.jwt() ->> 'email'
  );

create policy "group_admins: insert"
  on public.group_admins for insert
  with check (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or email = auth.jwt() ->> 'email'
  );

create policy "group_admins: super admin delete"
  on public.group_admins for delete
  using (auth.jwt() ->> 'email' = 'corneille261998@gmail.com');

-- ──────────────────────────────────────────────────────────
-- sessions
-- ──────────────────────────────────────────────────────────

create policy "sessions: public read"
  on public.sessions for select
  using (true);

create policy "sessions: admin write"
  on public.sessions for all
  using (
    auth.jwt() ->> 'email' = 'corneille261998@gmail.com'
    or exists (
      select 1 from public.group_admins
      where group_id = sessions.group_id
        and email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Hash mật khẩu trước khi lưu (chỉ authenticated user gọi được)
create or replace function public.hash_password(p_password text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select crypt(p_password, gen_salt('bf'))
$$;

revoke execute on function public.hash_password from public, anon;
grant  execute on function public.hash_password to authenticated;

-- Kiểm tra mật khẩu nhóm — chỉ Edge Function (service_role) gọi được
-- Không bao giờ trả hash về client
create or replace function public.check_group_password(p_group_id uuid, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select password_hash into v_hash
  from public.groups
  where id = p_group_id;

  if v_hash is null then
    return true;  -- không có mật khẩu → truy cập tự do
  end if;

  return v_hash = crypt(p_password, v_hash);
end;
$$;

revoke execute on function public.check_group_password from public, anon, authenticated;
grant  execute on function public.check_group_password to service_role;
