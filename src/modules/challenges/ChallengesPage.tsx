import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isCompleted } from '@/content/lessons'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { dueCards } from '@/modules/revision/srs'
import { assessmentFor, buildProgramme, CHALLENGES, currentDay, type ChallengeDays } from './programme'

const LENGTHS: ChallengeDays[] = [30, 60, 90]

export default function ChallengesPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [assessDay, setAssessDay] = useState<number | null>(null)
  const [result, setResult] = useState<(RunSummary & { day: number }) | null>(null)
  const [confirmStop, setConfirmStop] = useState(false)
  const minutes = data?.goals?.dailyMinutes ?? 30
  const active = data?.challenge ?? null
  const programme = useMemo(() => (active ? buildProgramme(active.days, minutes) : null), [active, minutes])
  if (!data) return null
  const completions = data.lessonCompletions

  if (active && programme && assessDay) {
    const questions = assessmentFor(programme, assessDay)
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <button type="button" className="label mb-6 min-h-11 text-soft" onClick={() => setAssessDay(null)}>← Challenge</button>
        <ExerciseRunner exercises={questions} sessionKind="practice" onFinish={(s) => { setResult({ ...s, day: assessDay }); setAssessDay(null) }} />
      </div>
    )
  }

  if (!active || !programme) {
    return (
      <div className="px-5 py-8 md:px-10 md:py-12">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">挑戦</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">30 / 60 / 90-day challenges</h1>
        <p className="mt-3 max-w-2xl text-soft">A day-by-day programme built from the published lessons and sized to your {minutes} minutes a day (change this in Settings). A challenge gives structure; it does not promise fluency or any JLPT result.</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {LENGTHS.map((len) => {
            const p = buildProgramme(len, minutes)
            return (
              <article key={len} className="border-t-4 border-ink pt-4">
                <p className="font-display text-[7rem] leading-none tracking-tighter">{len}</p>
                <p className="label -mt-1">days</p>
                <h2 className="mt-5 font-display text-2xl tracking-tight">{CHALLENGES[len].title}</h2>
                <p className="mt-2 text-soft">{CHALLENGES[len].focus}</p>
                <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line text-center">
                  {[['Lessons', p.totals.lessons], ['Vocabulary', p.totals.vocabulary], ['Grammar points', p.totals.grammar], ['Kanji', p.totals.kanji]].map(([l, v]) => (
                    <div key={l} className="bg-paper p-3"><dt className="label text-soft">{l}</dt><dd className="font-display text-3xl">{v}</dd></div>
                  ))}
                </dl>
                <p className="mt-3 text-sm leading-relaxed text-soft">
                  {Math.floor(len / 7)} weekly assessments and a final evaluation.
                  {p.openDays > 0 && ` ${p.openDays} study days have no new lesson yet because published lessons run out — those days are revision and studio practice.`}
                  {p.unscheduled > 0 && ` ${p.unscheduled} lessons do not fit at ${minutes} minutes a day.`}
                </p>
                <button type="button" className="btn btn-solid mt-5" onClick={() => update.mutate((s) => void (s.challenge = { days: len, startedAt: new Date().toISOString() }))}>Start {len}-day challenge</button>
              </article>
            )
          })}
        </div>
      </div>
    )
  }

  const today = currentDay(active.startedAt, new Date(), active.days)
  const scheduled = programme.days.flatMap((d) => d.lessons)
  const done = scheduled.filter((l) => isCompleted(l.slug, completions)).length
  const overdue = programme.days.filter((d) => d.day < today).flatMap((d) => d.lessons).filter((l) => !isCompleted(l.slug, completions))
  const todayPlan = programme.days[today - 1]!
  const due = dueCards(data.cards, new Date()).length

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <p className="label text-red">{active.days}-day challenge · {CHALLENGES[active.days].title}</p>
      <h1 className="mt-2 font-display text-6xl tracking-tighter md:text-8xl">Day {today}<span className="text-3xl text-soft"> / {active.days}</span></h1>
      <div className="mt-4 h-2 max-w-xl bg-line" role="progressbar" aria-label="Scheduled lessons completed" aria-valuemin={0} aria-valuemax={scheduled.length} aria-valuenow={done}>
        <div className="h-full bg-red" style={{ width: `${scheduled.length ? (done / scheduled.length) * 100 : 0}%` }} />
      </div>
      <p className="label mt-2 text-soft">{done} of {scheduled.length} scheduled lessons completed{overdue.length ? ` · ${overdue.length} behind schedule` : ''}</p>
      {result && <p className="mt-6 max-w-xl border-l-4 border-red bg-muted p-4" role="status">Day {result.day} assessment: {result.correct} of {result.total} correct.{result.missed.length ? ' Missed concepts are now on your dashboard under weak concepts.' : ''}</p>}

      <section className="mt-8 max-w-2xl border border-ink p-5">
        <h2 className="label text-red">Today</h2>
        {todayPlan.kind === 'study' ? (
          <ul className="mt-3">
            {[...overdue.slice(0, 2), ...todayPlan.lessons.filter((l) => !overdue.includes(l))].map((l) => (
              <li key={l.slug} className="flex items-center justify-between gap-3 border-b border-line py-3">
                <span><span className="font-medium">{l.title}</span><span className="block text-sm text-soft">{overdue.includes(l) ? 'Catch-up' : 'Lesson'} · {l.minutes} min · {l.vocab.length} words · {l.grammar.length} grammar points</span></span>
                {isCompleted(l.slug, completions) ? <span className="label text-red">済 done</span> : <Link to={`/app/lesson/${l.slug}`} className="btn">Open</Link>}
              </li>
            ))}
            {todayPlan.lessons.length === 0 && overdue.length === 0 && <li className="border-b border-line py-3 text-soft">No new lesson is published for today. Use the time for revision and a studio (reading, listening or writing).</li>}
            {todayPlan.kanji.length > 0 && <li className="flex items-center justify-between gap-3 border-b border-line py-3"><span>Kanji: <span lang="ja" className="font-jp-serif text-2xl font-black">{todayPlan.kanji.join(' ')}</span></span><Link to="/app/kanji" className="btn">Kanji Lab</Link></li>}
            <li className="flex items-center justify-between gap-3 py-3"><span>Revision<span className="block text-sm text-soft">about {todayPlan.revisionMinutes} min · {due} card{due === 1 ? '' : 's'} due now</span></span><Link to="/app/review" className="btn">Review</Link></li>
          </ul>
        ) : (
          <>
            <h3 className="mt-2 font-display text-3xl tracking-tight">{todayPlan.kind === 'final-evaluation' ? 'Final evaluation' : 'Weekly assessment'}</h3>
            <p className="mt-2 text-soft">{assessmentFor(programme, today).length} questions from the lessons scheduled {todayPlan.kind === 'final-evaluation' ? 'across the whole challenge' : 'this week'}.</p>
            <button type="button" className="btn btn-solid mt-4" disabled={assessmentFor(programme, today).length === 0} onClick={() => { setResult(null); setAssessDay(today) }}>Begin <span aria-hidden>→</span></button>
          </>
        )}
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">The whole programme</h2>
        <ol className="mt-3 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {programme.days.map((d) => (
            <li key={d.day} className={`min-h-16 bg-paper p-3 text-sm ${d.day === today ? 'outline-2 -outline-offset-2 outline-red' : ''} ${d.day < today ? 'opacity-60' : ''}`}>
              <span className="label text-soft">Day {d.day}</span>
              <span className="block">
                {d.kind === 'weekly-assessment' ? <button type="button" className="border-b border-ink font-medium" onClick={() => { setResult(null); setAssessDay(d.day) }} disabled={assessmentFor(programme, d.day).length === 0}>Weekly assessment</button>
                  : d.kind === 'final-evaluation' ? <button type="button" className="border-b border-ink font-medium" onClick={() => { setResult(null); setAssessDay(d.day) }}>Final evaluation</button>
                  : d.lessons.length ? d.lessons.map((l) => <span key={l.slug} className={`block ${isCompleted(l.slug, completions) ? 'text-red' : ''}`}>{isCompleted(l.slug, completions) ? '済 ' : ''}{l.title}</span>)
                  : <span className="text-soft">Revision and studio practice</span>}
                {d.kanji.length > 0 && <span lang="ja" className="block font-jp text-soft">漢字 {d.kanji.join('')}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        {confirmStop ? (
          <div className="flex flex-wrap gap-3" role="alert">
            <button type="button" className="btn btn-solid" onClick={() => { update.mutate((s) => void (s.challenge = null)); setConfirmStop(false) }}>Yes, end this challenge</button>
            <button type="button" className="btn" onClick={() => setConfirmStop(false)}>Keep going</button>
          </div>
        ) : <button type="button" className="label min-h-11 border-b border-line text-soft" onClick={() => setConfirmStop(true)}>End or switch challenge…</button>}
        <p className="mt-2 text-xs text-soft">Ending a challenge keeps all your lesson progress and revision cards.</p>
      </section>
    </div>
  )
}
