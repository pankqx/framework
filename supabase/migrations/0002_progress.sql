-- Tables for features added in Milestones 4-8 that the local store already tracks.
-- Like 0001, this has NOT yet been applied to or tested against a live Supabase project.

create table lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_key text not null,                 -- lesson slug (content currently ships with the app)
  correct int not null check (correct >= 0),
  total int not null check (total > 0 and correct <= total),
  completed_at timestamptz not null default now()
);
create index lesson_completions_user on lesson_completions (user_id, lesson_key);

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1500),
  written_at timestamptz not null default now()
);
create index diary_entries_user_time on diary_entries (user_id, written_at desc);

create table challenge_enrolments (
  user_id uuid primary key references profiles(id) on delete cascade,
  length_days int not null check (length_days in (30, 60, 90)),
  started_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['lesson_completions','diary_entries','challenge_enrolments']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_own', t);
  end loop;
end $$;
