import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Choice } from '@/components/Choice'
import { useLearner, useResetLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { repository, storagePersistent, supabaseConfigured } from '@/modules/learner/repository'
import type { Goals } from '@/modules/learner/types'
import { EXPLAIN, INTENSITY, MINUTES, PRIMARY_GOAL, STYLE, TARGET } from '@/modules/onboarding/options'

export default function SettingsPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const reset = useResetLearner()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Goals | null>(data?.goals ?? null)
  const [confirming, setConfirming] = useState(false)
  if (!draft || !data?.goals) return null

  const set = <K extends keyof Goals>(key: K, value: Goals[K]) => setDraft({ ...draft, [key]: value })
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.goals)

  return (
    <div className="max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <header className="pb-10">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">設定</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Settings</h1>
      </header>

      <section className="border-t border-ink pt-4">
        <h2 className="label text-soft">Goals</h2>
        <div className="mt-5 space-y-8">
          <Choice legend="Primary goal" options={PRIMARY_GOAL} value={draft.primaryGoal} onChange={(v) => set('primaryGoal', v)} />
          <Choice legend="JLPT target" options={TARGET} value={draft.jlptTarget} onChange={(v) => set('jlptTarget', v)} columns={2} />
          <Choice legend="Daily study time" options={MINUTES} value={draft.dailyMinutes} onChange={(v) => set('dailyMinutes', v)} columns={2} />
          <Choice legend="Intensity" options={INTENSITY} value={draft.intensity} onChange={(v) => set('intensity', v)} />
          <Choice legend="Learning style" options={STYLE} value={draft.learningStyle} onChange={(v) => set('learningStyle', v)} />
          <Choice legend="Explanations in" options={EXPLAIN} value={draft.explanationLanguage} onChange={(v) => set('explanationLanguage', v)} />
        </div>
        <div className="sticky bottom-16 mt-6 flex items-center gap-4 bg-paper py-3 md:bottom-0">
          <button type="button" className="btn btn-solid" disabled={!dirty || update.isPending} onClick={() => update.mutate((s) => void (s.goals = draft))}>
            {update.isPending ? 'Saving…' : 'Save goals'}
          </button>
          <p className="text-sm text-soft" aria-live="polite">{update.isSuccess && !dirty ? 'Saved. Your plan has been recalculated.' : dirty ? 'Unsaved changes' : ''}</p>
        </div>
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">Placement</h2>
        <p className="mt-4 leading-relaxed text-soft">
          Your level is {data.profile?.levelSource === 'placement' ? 'set by the placement assessment' : 'your own estimate'}. Retaking replaces it; earlier answers stay in your history.
        </p>
        <Link to="/onboarding?retake=1" className="btn mt-4">{data.profile?.levelSource === 'placement' ? 'Retake' : 'Take'} placement assessment</Link>
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">Services</h2>
        <ul className="mt-4">
          <Service name="Learner data" state={repository.mode === 'local' ? (storagePersistent ? 'Local — this browser only' : 'Not persisting — browser storage is blocked') : 'Supabase'} ok={storagePersistent} />
          <Service
            name="Accounts & sync (Supabase)"
            state={supabaseConfigured ? 'Keys detected, but account sync is not implemented in this build yet' : 'Not configured — see .env.example'}
            ok={false}
          />
          <Service name="AI Sensei" state="Not built yet — no AI provider is called by this build" ok={false} />
        </ul>
      </section>

      <section className="mt-12 border-t border-red pt-4">
        <h2 className="label text-red">Erase data</h2>
        <p className="mt-4 leading-relaxed text-soft">Deletes your profile, goals, answers and study history from this browser. This cannot be undone.</p>
        {confirming ? (
          <div className="mt-4 flex flex-wrap gap-3" role="alert">
            <button type="button" className="btn btn-solid" onClick={async () => { await reset.mutateAsync(); navigate('/') }}>Yes, erase everything</button>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn mt-4" onClick={() => setConfirming(true)}>Erase my data…</button>
        )}
      </section>
    </div>
  )
}

function Service({ name, state, ok }: { name: string; state: string; ok: boolean }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3">
      <span className="font-medium">{name}</span>
      <span className="label flex items-center gap-2 text-soft">
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-blue' : 'border border-current'}`} />
        {state}
      </span>
    </li>
  )
}
