-- Migration: Phase 1 Init (Idempotent)
-- Description: Create organizations, profiles, tests, assignments, results with RLS and Indexes.
-- SAFE TO RE-RUN: Handles existing objects gracefully.

-- Step 1: Create ENUM types
do $$ begin
  create type user_role as enum ('manager', 'leader');
exception
  when duplicate_object then null;
end $$;

-- Step 2: Create all tables
-- 2.1 Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 2.2 Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  organization_id uuid references organizations(id),
  role user_role not null default 'leader',
  created_at timestamptz default now(),
  unique(user_id)
);

-- 2.3 Tests (Models like DISC)
create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  questions jsonb not null,
  created_at timestamptz default now()
);

-- 2.4 Assignments
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references profiles(user_id) not null,
  test_id uuid references tests(id) not null,
  assigned_at timestamptz default now(),
  completed_at timestamptz,
  organization_id uuid references organizations(id) not null
);

-- 2.5 Results
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) not null,
  answers jsonb not null,
  score jsonb,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Step 3: Enable RLS on all tables (Idempotent)
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table tests enable row level security;
alter table assignments enable row level security;
alter table results enable row level security;

-- Step 4: Create RLS Policies (Drop first to allow updates/re-runs)

-- 4.1 Organizations Policies
drop policy if exists "Managers can view their organization" on organizations;
create policy "Managers can view their organization"
  on organizations for select
  using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.organization_id = organizations.id
      and profiles.role = 'manager'
    )
  );

-- 4.2 Profiles Policies
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Managers can view profiles in their org" on profiles;
create policy "Managers can view profiles in their org"
  on profiles for select
  using (
    exists (
      select 1 from profiles as manager
      where manager.user_id = auth.uid()
      and manager.role = 'manager'
      and manager.organization_id = profiles.organization_id
    )
  );

-- 4.3 Tests Policies
drop policy if exists "Authenticated users can view tests" on tests;
create policy "Authenticated users can view tests"
  on tests for select
  to authenticated
  using (true);

-- 4.4 Assignments Policies
drop policy if exists "Leaders view own assignments" on assignments;
create policy "Leaders view own assignments"
  on assignments for select
  using (leader_id = auth.uid());

drop policy if exists "Managers view org assignments" on assignments;
create policy "Managers view org assignments"
  on assignments for select
  using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'manager'
      and profiles.organization_id = assignments.organization_id
    )
  );

-- 4.5 Results Policies
drop policy if exists "Leaders view own results" on results;
create policy "Leaders view own results"
  on results for select
  using (user_id = auth.uid());

drop policy if exists "Managers view org results" on results;
create policy "Managers view org results"
  on results for select
  using (
    exists (
      select 1 from assignments
      join profiles on profiles.organization_id = assignments.organization_id
      where assignments.id = results.assignment_id
      and profiles.user_id = auth.uid()
      and profiles.role = 'manager'
    )
  );

-- Step 5: Create Indexes (Idempotent)
create index if not exists idx_profiles_org on profiles(organization_id);
create index if not exists idx_profiles_user on profiles(user_id);
create index if not exists idx_assignments_leader on assignments(leader_id);
create index if not exists idx_assignments_org on assignments(organization_id);
create index if not exists idx_results_assignment on results(assignment_id);
create index if not exists idx_results_user on results(user_id);
