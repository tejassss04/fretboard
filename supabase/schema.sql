-- Fretboard v1 data model. Run this in the Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  skill_level text check (skill_level in ('Beginner', 'Intermediate', 'Advanced')),
  weekly_goal_minutes integer not null default 210,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_seconds integer not null check (duration_seconds >= 0),
  completed_tasks jsonb not null default '[]'::jsonb,
  focus text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  chord_progression text,
  practice_progress integer not null default 0 check (practice_progress between 0 and 100),
  last_practiced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  metronome_bpm integer not null default 76 check (metronome_bpm between 30 and 240),
  time_signature integer not null default 4 check (time_signature in (3, 4, 6)),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.saved_songs enable row level security;
alter table public.user_settings enable row level security;

create policy "Users manage their profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage their practice sessions" on public.practice_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their songs" on public.saved_songs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their settings" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.create_profile_for_user();
