-- =========================================================================
-- CareerCraft AI — Complete Schema
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Profiles table
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  resume_text text,
  latest_ats_score integer,
  latest_analysis jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 2. Auto-create profile on signup
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------------------------
-- 3. Interview sessions
-- -------------------------------------------------------------------------
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text,
  questions jsonb,
  answers jsonb,
  feedback jsonb,
  created_at timestamptz default now()
);

alter table public.interview_sessions enable row level security;

drop policy if exists "Users can manage own sessions" on public.interview_sessions;
create policy "Users can manage own sessions"
  on public.interview_sessions for all
  using (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- 4. Resume PDF storage bucket
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own resume PDF" on storage.objects;
create policy "Users can upload own resume PDF"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own resume PDF" on storage.objects;
create policy "Users can read own resume PDF"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own resume PDF" on storage.objects;
create policy "Users can update own resume PDF"
  on storage.objects for update
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own resume PDF" on storage.objects;
create policy "Users can delete own resume PDF"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
