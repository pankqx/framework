-- KOTOBA initial schema.
-- "users" is Supabase's auth.users; everything learner-owned hangs off profiles.id (= auth.users.id).
-- Curriculum tables are world-readable once published; learner tables are private via RLS.
-- NOTE: written for Milestone 2. It has not yet been applied to or tested against a live
-- Supabase project — do that (including the RLS checks in docs/ARCHITECTURE.md) before relying on it.

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type skill as enum ('kana','vocabulary','kanji','grammar','reading','listening','speaking','writing');
create type content_status as enum ('draft','reviewed','published');
create type source_kind as enum ('official_jlpt','reference','original');
create type card_rating as enum ('again','hard','good','easy');
create type plan_tier as enum ('free','paid');

-- ---------- curriculum (shared content) ----------
create table proficiency_levels (
  id text primary key,                      -- 'foundation','n5','n4','n3','n2','n1'
  title text not null,
  position int not null unique,
  description text
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                -- 'core','tech-lab','jlpt'
  title text not null,
  description text,
  min_tier plan_tier not null default 'free',
  status content_status not null default 'draft'
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  level_id text not null references proficiency_levels(id),
  slug text not null,
  title text not null,
  position int not null,
  status content_status not null default 'draft',
  unique (course_id, slug),
  unique (course_id, level_id, position)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  slug text not null,
  title text not null,
  unit text,                                -- grouping inside a module
  position int not null,
  objectives text[] not null default '{}',
  mastery_criteria jsonb not null default '{}',
  estimated_minutes int check (estimated_minutes > 0),
  status content_status not null default 'draft',
  unique (module_id, slug),
  unique (module_id, position)
);

-- Ordered blocks of a lesson (introduction, explanation, examples, summary ...).
create table lesson_content (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  position int not null,
  kind text not null,
  body jsonb not null,
  source_kind source_kind not null default 'original',
  source_ref text,                          -- attribution: title/URL of the reference used
  unique (lesson_id, position)
);

create table grammar_concepts (
  id uuid primary key default gen_random_uuid(),
  level_id text not null references proficiency_levels(id),
  slug text not null unique,
  pattern text not null,
  meaning text not null,
  explanation text,
  formality text,                           -- 'formal','casual','neutral'
  source_kind source_kind not null default 'reference',
  source_ref text
);

create table vocabulary (
  id uuid primary key default gen_random_uuid(),
  level_id text references proficiency_levels(id),
  term text not null,
  reading text not null,
  meaning text not null,
  part_of_speech text,
  domain text,                              -- e.g. 'tech' for Tech Lab
  source_kind source_kind not null default 'reference',
  source_ref text,
  unique (term, reading)
);

create table kanji (
  id uuid primary key default gen_random_uuid(),
  level_id text references proficiency_levels(id),
  character text not null unique check (char_length(character) = 1),
  meanings text[] not null,
  onyomi text[] not null default '{}',
  kunyomi text[] not null default '{}',
  stroke_count int check (stroke_count > 0),
  radical text,
  stroke_data jsonb,                        -- stroke paths + licence of the source dataset
  similar text[] not null default '{}',
  source_ref text
);

create table example_sentences (
  id uuid primary key default gen_random_uuid(),
  japanese text not null,
  reading text,
  translation text,
  register text,
  grammar_concept_id uuid references grammar_concepts(id) on delete set null,
  vocabulary_id uuid references vocabulary(id) on delete set null,
  kanji_id uuid references kanji(id) on delete set null,
  source_kind source_kind not null default 'original',
  source_ref text
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  level_id text references proficiency_levels(id),
  skill skill not null,
  kind text not null,                       -- 'multiple_choice','fill_blank','word_order','typing',...
  concept_key text not null,                -- what a wrong answer says the learner is weak at
  prompt jsonb not null,
  answer jsonb not null,
  explanation jsonb not null,               -- why right, and why each distractor is wrong
  source_kind source_kind not null default 'original'
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                       -- 'placement','lesson_check','weekly','jlpt_mock'
  level_id text references proficiency_levels(id),
  title text not null,
  time_limit_seconds int,
  structure jsonb not null default '{}'     -- sections, timings, exercise ids
);

create table achievements (
  id text primary key,
  title text not null,
  description text not null,
  criteria jsonb not null                   -- evaluated from real activity only
);

-- ---------- learner (private) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  explanation_language text not null default 'en',
  tier plan_tier not null default 'free',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table learner_goals (
  user_id uuid primary key references profiles(id) on delete cascade,
  primary_goal text not null,
  jlpt_target text not null references proficiency_levels(id),
  current_level text not null references proficiency_levels(id),
  daily_minutes int not null check (daily_minutes between 5 and 480),
  learning_style text not null,
  intensity text not null,
  prior_experience text,
  updated_at timestamptz not null default now()
);

create table learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  lesson_id uuid references lessons(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  check (ended_at >= started_at)
);
create index learning_sessions_user_time on learning_sessions (user_id, started_at desc);

create table exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  exercise_key text not null,               -- stable key, also covers built-in placement items
  concept_key text not null,
  skill skill not null,
  level_id text references proficiency_levels(id),
  response jsonb,
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);
create index exercise_attempts_user_time on exercise_attempts (user_id, attempted_at desc);
create index exercise_attempts_user_concept on exercise_attempts (user_id, concept_key);

create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete set null,
  kind text not null,
  level_id text references proficiency_levels(id),
  score jsonb not null,                     -- per-section raw results; never an "official JLPT score"
  taken_at timestamptz not null default now()
);
create index assessment_results_user_time on assessment_results (user_id, taken_at desc);

create table learner_mastery (
  user_id uuid not null references profiles(id) on delete cascade,
  concept_key text not null,
  skill skill not null,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  successful_recalls int not null default 0, -- from spaced reviews, not lesson completion
  mastered_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_key)
);

create table revision_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill skill not null,
  concept_key text,
  vocabulary_id uuid references vocabulary(id) on delete set null,
  kanji_id uuid references kanji(id) on delete set null,
  grammar_concept_id uuid references grammar_concepts(id) on delete set null,
  front jsonb not null,                     -- custom cards store their own content
  back jsonb not null,
  is_custom boolean not null default false,
  due_at timestamptz not null default now(),
  interval_days numeric not null default 0,
  ease numeric not null default 2.5,
  repetitions int not null default 0,
  lapses int not null default 0,
  created_at timestamptz not null default now()
);
create index revision_cards_user_due on revision_cards (user_id, due_at);

create table revision_reviews (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references revision_cards(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating card_rating not null,
  interval_before numeric not null,
  interval_after numeric not null,
  reviewed_at timestamptz not null default now()
);
create index revision_reviews_user_time on revision_reviews (user_id, reviewed_at desc);

create table conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode text not null,                       -- teach, ask, correction, conversation, immersion, challenge, grammar, reading
  lesson_id uuid references lessons(id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references conversation_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index conversation_messages_session on conversation_messages (session_id, created_at);

create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table user_achievements (
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id text not null references achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------- row level security ----------
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;

-- Shared content: anyone may read published rows; only admins write.
do $$
declare t text;
begin
  foreach t in array array['proficiency_levels','courses','modules','lessons','lesson_content',
    'grammar_concepts','vocabulary','kanji','example_sentences','exercises','assessments','achievements']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select using (true)', t || '_read', t);
    execute format('create policy %I on %I for all using (is_admin()) with check (is_admin())', t || '_admin', t);
  end loop;
end $$;

-- Draft content is hidden from non-admins on the tables that carry a status.
drop policy courses_read on courses;
create policy courses_read on courses for select using (status = 'published' or is_admin());
drop policy modules_read on modules;
create policy modules_read on modules for select using (status = 'published' or is_admin());
drop policy lessons_read on lessons;
create policy lessons_read on lessons for select using (status = 'published' or is_admin());

-- Learner data: a user sees and writes only their own rows.
alter table profiles enable row level security;
create policy profiles_select on profiles for select using (id = auth.uid());
create policy profiles_insert on profiles for insert with check (id = auth.uid() and not is_admin and tier = 'free');
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Learners may not promote themselves: tier/is_admin change only via the service role.
create or replace function protect_profile_privileges() returns trigger
language plpgsql as $$
begin
  if auth.role() <> 'service_role' and (new.is_admin is distinct from old.is_admin or new.tier is distinct from old.tier) then
    raise exception 'tier and is_admin cannot be changed by the account owner';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on profiles
  for each row execute function protect_profile_privileges();

do $$
declare t text;
begin
  foreach t in array array['learner_goals','learning_sessions','exercise_attempts','assessment_results',
    'learner_mastery','revision_cards','revision_reviews','conversation_sessions','conversation_messages',
    'bookmarks','user_achievements']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_own', t);
  end loop;
end $$;

-- ---------- seed: levels ----------
insert into proficiency_levels (id, title, position) values
  ('foundation','Foundation',0),('n5','JLPT N5',1),('n4','JLPT N4',2),
  ('n3','JLPT N3',3),('n2','JLPT N2',4),('n1','JLPT N1',5);
