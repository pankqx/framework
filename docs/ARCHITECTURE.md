# KOTOBA architecture

## Stack

React 19 + TypeScript + Vite · Tailwind CSS v4 · Motion · React Router · TanStack Query · Zod · Vitest · Playwright (driving installed Chrome). Backend target: Supabase (Postgres, Auth, Edge Functions).

## Layout

```
src/
  app/            router and route guards
  components/     AppShell, Loader, Choice, JP (furigana), AudioButton, ThemeToggle
  content/        ALL teaching content as typed data: lessons, kana, kanji, studio, jlpt, techlab
  lib/            id, speech (synthesis + recognition wrappers)
  modules/
    learner/      Zod schemas, repository interface, local adapter, query hooks
    onboarding/   form, placement assessment, plan generator
    exercises/    exercise types, evaluation, ExerciseRunner
    lessons/      lesson page (learn → practise → apply → check → summary)
    revision/     SRS scheduler + review page
    curriculum/   level/module structure + page
    dashboard/ analytics/ kanji/ sensei/ reading/ listening/ writing/ jlpt/ techlab/ challenges/ settings/ landing/
supabase/
  migrations/     schema + RLS
  functions/sensei/        provider-independent AI endpoint
  functions/_shared/       prompt builder + request validation (also unit-tested from the app)
tests/            unit tests      e2e/  browser test
```

## Key decisions

- **One data door.** Screens only use `LearnerRepository` (`load / update / reset`). Today it is `localStorage`; a Supabase adapter can replace it without touching screens. Saved state is validated with Zod on every read and write; newer fields have defaults so older saves still load.
- **One exercise engine.** Lessons, placement drills, JLPT practice, reading, listening, Tech Lab and challenges all run through `ExerciseRunner`. It evaluates, explains why, and records each attempt (with a concept key) and the study session as it happens. Weak concepts, accuracy, streaks and study time are all derived from those records in `analytics/stats.ts`.
- **Content is data.** A lesson is a typed object; adding one to `src/content` makes it appear in the curriculum, the recommendations, the challenges and the tests. Content integrity tests check every exercise is answerable and unambiguous.
- **Mastery is earned.** Completing a lesson needs the mini assessment passed (≥ 2/3) and creates revision cards. "Mastered" requires `masteryRepetitions` successful recalls in a row and an interval ≥ `masteryIntervalDays` (see `DEFAULT_SRS`).
- **AI stays server-side.** The browser sends mode + learner context + messages to the edge function; the function builds the system prompt and calls whichever provider the secrets select. No key or prompt logic depends on the client.
- **Honest fallbacks.** Missing Japanese voice, unsupported speech recognition, blocked storage and an unconnected Sensei each show a plain explanation instead of pretending.

## Design system

Tokens are CSS variables in `src/styles/index.css` (light and dark): paper `#F4F0E7`, ink `#171717`, red `#E64D36`, blue `#5269E8`, muted `#E9E3D8`, dark `#141414`. Type: Fraunces (display), Inter (UI), Noto Serif JP / Noto Sans JP. Square corners, hairline rules, numbered section heads, oversized kanji as graphics. Motion is limited to reveals and progress, and is disabled under `prefers-reduced-motion`.

## Database

`supabase/migrations/0001_init.sql` and `0002_progress.sql` define curriculum tables (readable when published, writable by admins) and learner tables (row-level security: `user_id = auth.uid()`), plus `tier`/`is_admin` on profiles for future plans and administration, protected from self-promotion by a trigger.

**Before relying on it**, apply to a project and verify as two different users: (1) user A cannot select, insert, update or delete user B's rows in every learner table; (2) an anonymous client reads only published curriculum rows; (3) a user cannot change their own `tier` or `is_admin`. None of this has been run yet.

## Tests

- `npm test` — placement scoring, plan allocation, statistics, repository, SRS, content integrity, challenge programmes, Sensei prompt/validation.
- `npm run test:e2e` — onboarding → placement → dashboard → goal change → full lesson → revision → JLPT section → challenge → every page, at 390 px and 1440 px, asserting no horizontal overflow and no console errors.

## Known gaps / next steps

1. Supabase auth + repository adapter; apply and test the migrations.
2. Deploy and exercise the Sensei function against a real provider.
3. Teacher review of all content; more N3 lessons; N2/N1 content.
4. Stroke-order data (KanjiVG, CC BY-SA) and recorded audio.
5. Full-length mock exams need a much larger question bank.
6. Accessibility has the basics (labels, focus, keyboard, reduced motion) but has not had a screen-reader audit.
