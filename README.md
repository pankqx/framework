# KOTOBA 言葉

A Japanese-only learning platform: structured lessons from kana to the start of N3, spaced-repetition revision, a Kanji Lab, reading / listening / speaking / writing studios, JLPT practice, a Tech Lab for developers, and an AI tutor (Sensei).

> 言葉から、世界が広がる。 — Through language, the world opens up.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (Vitest)
npm run build && npm run test:e2e   # browser test in installed Google Chrome, mobile + desktop
```

No configuration is needed. With no environment variables KOTOBA runs in **local mode**: all learner data is stored in this browser (`localStorage`), and the app says so.

## What works today, and what does not

| Area | State |
| --- | --- |
| Landing, onboarding, placement assessment, learning plan | Working |
| Dashboard, analytics | Working — every number is computed from recorded activity |
| Lessons | 33 published: hiragana (10), katakana (10), sound & rhythm, N5 (5), N4 (4), N3 (3). N2/N1 are outlines only |
| Exercises | Multiple choice, word order, typing; every answer is explained |
| Revision | SM-2 style scheduler, Again/Hard/Good/Easy, custom cards, mastery by repeated recall |
| Kanji Lab | 30 kanji with readings, compounds, look-alikes, reading quiz, tracing pad. **No stroke-order animation** (needs a stroke dataset such as KanjiVG) |
| Reading / Writing | 3 graded passages with furigana control; typing drills; diary. Writing feedback needs Sensei |
| Listening / Speaking | Uses the device's speech synthesis and the browser's speech recognition. **No recorded native audio**; no pronunciation scoring |
| JLPT centre | N5/N4/N3 short practice sets (original questions), timed or untimed, history and weak-area analysis. Not full-length papers; never an official score |
| Tech Lab | Vocabulary, 8 exercises, self-checked written responses |
| 30/60/90-day challenges | Day-by-day programme generated from published lessons and your daily minutes |
| AI Sensei | Code complete (8 modes, provider-independent edge function) but **not connected and never run against a live provider**. Offline lesson search and weak-point drill work without it |
| Accounts & cloud sync | **Not implemented.** The Postgres schema with RLS is written (`supabase/migrations`) but has never been applied to a real project |

### Content honesty

All lessons, passages and questions are original and were written without review by a qualified native-speaking teacher. Treat them as a draft curriculum: have them checked before relying on them or offering them to others. The JLPT publishes no official vocabulary, kanji or grammar lists, so level labels follow common teaching convention. Official exam section times are taken from jlpt.jp. KOTOBA is not affiliated with the JLPT.

## Switching on AI Sensei

1. Create a Supabase project. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Set server-side secrets (these never reach the browser):
   ```bash
   supabase secrets set AI_PROVIDER=anthropic AI_API_KEY=... AI_MODEL=<model id>
   # or: AI_PROVIDER=openai-compatible AI_BASE_URL=https://api.openai.com/v1
   supabase secrets set ALLOWED_ORIGIN=https://your-site.example
   ```
3. `supabase functions deploy sensei`, then restart the app.

To change model or provider later, change the secrets — no app code changes. Note: until accounts exist, the function accepts any request carrying your public anon key, so anyone who finds your site could spend your AI credit. Keep the deployment private or add a usage cap at your provider.

## Deployment

Static build (`npm run build` → `dist/`).

- **Vercel:** import the repo; framework preset Vite. `vercel.json` already rewrites all routes to `index.html`.
- **Cloudflare Pages:** build command `npm run build`, output `dist`. `public/_redirects` handles routing.

Set the two `VITE_` variables in the host's dashboard if you use Supabase.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Browser (public) | Where Sensei requests are sent. Optional |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL` | Edge function secrets only | Which model answers as Sensei |
| `ALLOWED_ORIGIN` | Edge function secret | CORS origin for the function (defaults to `*`) |

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Designed & engineered with curiosity.
