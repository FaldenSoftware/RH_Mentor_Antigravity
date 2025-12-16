-- Migration: Phase 2 Auth & Invitations
-- Description: Create invitations table and triggers for auto-provisioning users.

-- Part 1: Invitations Table
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  email text not null,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  role user_role not null default 'leader',
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days'),
  created_by uuid references auth.users(id)
);

alter table invitations enable row level security;

create index if not exists idx_invitations_token on invitations(token);
create index if not exists idx_invitations_org on invitations(organization_id);

-- RLS for Invitations
-- Managers can view/create/delete invitations for their org
drop policy if exists "Managers manage org invitations" on invitations;
create policy "Managers manage org invitations"
  on invitations for all
  using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'manager'
      and profiles.organization_id = invitations.organization_id
    )
  );

-- Part 2: Trigger Function for User Provisioning
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta_org_name text;
  meta_invite_token text;
  new_org_id uuid;
  invite_record record;
begin
  -- Extract metadata
  meta_org_name := new.raw_user_meta_data->>'org_name';
  meta_invite_token := new.raw_user_meta_data->>'invite_token';

  -- Case 1: Manager Signup (Creating Org)
  if meta_org_name is not null then
    -- Create Organization
    insert into organizations (name)
    values (meta_org_name)
    returning id into new_org_id;

    -- Create Profile as Manager
    insert into profiles (user_id, organization_id, role)
    values (new.id, new_org_id, 'manager');

  -- Case 2: Leader Signup (Via Invite)
  elsif meta_invite_token is not null then
    -- Validate Invite
    select * into invite_record
    from invitations
    where token = meta_invite_token
    and expires_at > now();

    if invite_record is null then
      raise exception 'Invalid or expired invitation token';
    end if;

    -- Optional: Check email match if strictly required
    -- if invite_record.email <> new.email then ... end if;

    -- Create Profile as Leader linked to Invite Org
    insert into profiles (user_id, organization_id, role)
    values (new.id, invite_record.organization_id, invite_record.role);

    -- Consume Invite (Delete it)
    delete from invitations where id = invite_record.id;
  
  -- Case 3: Fallback / Error
  else
    -- Option: Allow orphan user without profile? Or Fail?
    -- For this system, we force strictly defined flows.
    -- raise exception 'User must provide org_name or invite_token';
    
    -- SOFT FAIL: Create profile with no org (pending state) if we want to support that.
    -- BUT requirements say "Manager creates org" or "Leader invited".
    -- Let's log it or create a basic profile to avoid blocking auth completely if metadata is missing by mistake,
    -- but usually we want to enforce. Let's enforce for now to be "robust".
    raise exception 'Registration requires organization creation or invitation.';
  end if;

  return new;
end;
$$;

-- Trigger Definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Part 3: Helper to validate token (Public RPC)
-- Useful for frontend to check token validity before showing registration form
create or replace function check_invite_token(token_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  invite_data record;
begin
  select organization_id, email, role into invite_data
  from invitations
  where token = token_input
  and expires_at > now();

  if invite_data is null then
    return jsonb_build_object('valid', false);
  else
    return jsonb_build_object(
      'valid', true,
      'email', invite_data.email
    );
  end if;
end;
$$;
