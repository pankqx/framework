import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Choice } from '@/components/Choice'
import { Loader } from '@/components/Loader'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { goalsSchema, LEVEL_LABEL, type Goals, type Level } from '@/modules/learner/types'
import { EXPERIENCE, EXPLAIN, INTENSITY, MINUTES, PRIMARY_GOAL, SELF_LEVEL, STYLE, TARGET } from './options'
import { Placement, type PlacementOutcome } from './Placement'
import { PlanView } from './PlanView'
import { generatePlan } from './plan'
import { SELF_REPORT_TO_LEVEL } from './placement'

type Step = 'name' | 'level' | 'goal' | 'time' | 'style' | 'assess' | 'placement' | 'plan'
const FORM_STEPS: Step[] = ['name', 'level', 'goal', 'time', 'style', 'assess']

export default function OnboardingPage() {
  const { data, isPending } = useLearner()
  if (isPending || !data) return <Loader />
  return <Onboarding existingName={data.profile?.displayName ?? ''} existingGoals={data.goals} />
}

function Onboarding({ existingName, existingGoals }: { existingName: string; existingGoals: Goals | null }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const update = useUpdateLearner()
  const retake = params.get('retake') === '1' && existingGoals !== null

  const [step, setStep] = useState<Step>(retake ? 'placement' : 'name')
  const [name, setName] = useState(existingName)
  const [draft, setDraft] = useState<Partial<Goals>>(existingGoals ?? { jlptTarget: 'n3', learningStyle: 'comprehensive' })
  const [outcome, setOutcome] = useState<PlacementOutcome | null>(null)
  const set = <K extends keyof Goals>(key: K, value: Goals[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const goals = useMemo(() => goalsSchema.safeParse(draft), [draft])
  const level: Level = outcome?.result.placedLevel ?? SELF_REPORT_TO_LEVEL[draft.selfReportedLevel ?? 'none'] ?? 'foundation'
  const plan = goals.success ? generatePlan(goals.data, level) : null

  const ready: Record<Step, boolean> = {
    name: name.trim().length > 0,
    level: Boolean(draft.selfReportedLevel && draft.priorExperience),
    goal: Boolean(draft.primaryGoal && draft.jlptTarget),
    time: Boolean(draft.dailyMinutes && draft.intensity),
    style: Boolean(draft.learningStyle && draft.explanationLanguage),
    assess: true,
    placement: true,
    plan: goals.success,
  }
  const formIndex = FORM_STEPS.indexOf(step)
  const go = (delta: number) => setStep(FORM_STEPS[formIndex + delta] ?? step)

  const save = async () => {
    if (!goals.success) return
    await update.mutateAsync((state) => {
      state.profile = {
        displayName: name.trim(),
        currentLevel: level,
        levelSource: outcome ? 'placement' : 'self-reported',
        createdAt: state.profile?.createdAt ?? new Date().toISOString(),
      }
      state.goals = goals.data
      if (outcome) {
        state.attempts.push(...outcome.attempts)
        state.sessions.push(outcome.session)
        state.assessmentResults.push(outcome.result)
      }
    })
    navigate('/app')
  }

  return (
    <div className="grid min-h-dvh bg-paper text-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Editorial side panel: the step, as a character. */}
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:block">
        <Link to="/" className="label">← Kotoba</Link>
        <span lang="ja" aria-hidden key={step} className="ink-in absolute -bottom-10 -left-6 font-jp-serif text-[30vw] leading-none font-black text-red">
          {{ name: '名', level: '今', goal: '夢', time: '時', style: '型', assess: '試', placement: '問', plan: '道' }[step]}
        </span>
        <p className="vertical label absolute top-10 right-10 h-72 opacity-60">はじめまして — nice to meet you</p>
      </aside>

      <main className="mx-auto flex w-full max-w-2xl flex-col px-5 py-8 md:px-10 md:py-14">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="font-jp-serif text-2xl font-black text-red" aria-label="KOTOBA home">言葉</Link>
        </div>

        {formIndex >= 0 && (
          <div className="mt-6 flex gap-1 lg:mt-0" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={FORM_STEPS.length} aria-valuenow={formIndex + 1}>
            {FORM_STEPS.map((s, i) => (
              <span key={s} className={`h-1 flex-1 ${i <= formIndex ? 'bg-red' : 'bg-line'}`} />
            ))}
          </div>
        )}

        <div className="fade-up mt-10 flex-1" key={step}>
          {step === 'name' && (
            <Frame jp="お名前は？" title="What should we call you?">
              <label className="label text-soft" htmlFor="name">Your name</label>
              <input
                id="name"
                autoFocus
                autoComplete="given-name"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ready.name && go(1)}
                className="mt-2 w-full border-b-2 border-ink bg-transparent py-3 font-display text-4xl tracking-tight outline-none placeholder:text-line focus:border-red"
                placeholder="Name"
              />
            </Frame>
          )}
          {step === 'level' && (
            <Frame jp="今のレベル" title="Where are you now?">
              <Choice legend="Current Japanese" options={SELF_LEVEL} value={draft.selfReportedLevel ?? null} onChange={(v) => set('selfReportedLevel', v)} />
              <div className="mt-8">
                <Choice legend="Previous learning experience" options={EXPERIENCE} value={draft.priorExperience ?? null} onChange={(v) => set('priorExperience', v)} columns={2} />
              </div>
            </Frame>
          )}
          {step === 'goal' && (
            <Frame jp="目標" title="What are you learning for?">
              <Choice legend="Primary goal" options={PRIMARY_GOAL} value={draft.primaryGoal ?? null} onChange={(v) => set('primaryGoal', v)} />
              <div className="mt-8">
                <Choice legend="JLPT target" options={TARGET} value={draft.jlptTarget ?? null} onChange={(v) => set('jlptTarget', v)} columns={2} />
              </div>
            </Frame>
          )}
          {step === 'time' && (
            <Frame jp="時間" title="How much time each day?">
              <Choice legend="Daily study time" options={MINUTES} value={draft.dailyMinutes ?? null} onChange={(v) => set('dailyMinutes', v)} columns={2} />
              <div className="mt-8">
                <Choice legend="Intensity" options={INTENSITY} value={draft.intensity ?? null} onChange={(v) => set('intensity', v)} />
              </div>
            </Frame>
          )}
          {step === 'style' && (
            <Frame jp="学び方" title="How do you like to learn?">
              <Choice legend="Learning style" options={STYLE} value={draft.learningStyle ?? null} onChange={(v) => set('learningStyle', v)} />
              <div className="mt-8">
                <Choice legend="Explanations in" options={EXPLAIN} value={draft.explanationLanguage ?? null} onChange={(v) => set('explanationLanguage', v)} />
              </div>
            </Frame>
          )}
          {step === 'assess' && (
            <Frame jp="診断" title="Find your real starting point">
              <p className="leading-relaxed text-soft">
                The placement assessment has up to 16 short questions across four stages — kana, N5, N4 and N3. It stops as soon as a stage is beyond you, explains every answer, and usually takes under ten minutes.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-soft">It is an estimate to position your plan, not a JLPT result.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="btn btn-solid" onClick={() => setStep('placement')}>Take the assessment <span aria-hidden>→</span></button>
                <button type="button" className="btn" onClick={() => setStep('plan')}>Skip — use my own estimate</button>
              </div>
            </Frame>
          )}
          {step === 'placement' && <Placement onDone={(o) => { setOutcome(o); setStep('plan') }} />}
          {step === 'plan' && plan && (
            <Frame jp="あなたの道" title={`${name.trim() || 'Your'}${name.trim() ? '’s' : ''} learning plan`}>
              <div className="border-l-4 border-red bg-muted p-5">
                <p className="label text-soft">Starting level</p>
                <p className="mt-1 font-display text-4xl tracking-tight">{LEVEL_LABEL[level]}</p>
                <p className="mt-2 text-sm leading-relaxed text-soft">
                  {outcome
                    ? `Placed by assessment: ${outcome.result.bands.map((b) => `${LEVEL_LABEL[b.level]} ${b.correct}/${b.total}`).join(' · ')}. A stage counts as passed at 3 of 4.`
                    : 'Based on your own estimate. You can take the placement assessment later from Settings.'}
                </p>
              </div>
              <div className="mt-8"><PlanView plan={plan} current={level} /></div>
              <button type="button" className="btn btn-solid mt-8" disabled={update.isPending} onClick={save}>
                {update.isPending ? 'Saving…' : 'Open my dashboard'} <span aria-hidden>→</span>
              </button>
              {update.isError && <p role="alert" className="mt-3 text-sm text-red">Could not save your plan. Please try again.</p>}
            </Frame>
          )}
        </div>

        {formIndex >= 0 && step !== 'assess' && (
          <div className="mt-10 flex items-center justify-between border-t border-line pt-5">
            <button type="button" className="label min-h-11 disabled:opacity-30" disabled={formIndex === 0} onClick={() => go(-1)}>← Back</button>
            <button type="button" className="btn" disabled={!ready[step]} onClick={() => go(1)}>Continue <span aria-hidden>→</span></button>
          </div>
        )}
        {step === 'assess' && (
          <div className="mt-10 border-t border-line pt-5">
            <button type="button" className="label min-h-11" onClick={() => go(-1)}>← Back</button>
          </div>
        )}
      </main>
    </div>
  )
}

function Frame({ jp, title, children }: { jp: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <p lang="ja" className="font-jp text-sm font-bold text-red">{jp}</p>
      <h1 className="mt-2 mb-8 font-display text-4xl leading-tight tracking-tight md:text-5xl">{title}</h1>
      {children}
    </section>
  )
}
