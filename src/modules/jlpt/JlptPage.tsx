import { useState } from 'react'
import { examQuestions, OFFICIAL_MINUTES, PACE_SECONDS, SECTION_LABEL, type ExamLevel, type ExamSection } from '@/content/jlpt'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { JP } from '@/components/JP'
import { newId } from '@/lib/id'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL } from '@/modules/learner/types'
import { formatDuration } from '@/modules/analytics/stats'

const LEVELS: ExamLevel[] = ['n5', 'n4', 'n3']
const SECTIONS: ExamSection[] = ['vocabulary', 'grammar-reading', 'listening']

export default function JlptPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const target = data?.goals?.jlptTarget
  const [level, setLevel] = useState<ExamLevel>(target === 'n5' || target === 'n4' ? target : 'n3')
  const [run, setRun] = useState<{ section: ExamSection; timed: boolean } | null>(null)
  const [last, setLast] = useState<(RunSummary & { section: ExamSection; timed: boolean }) | null>(null)
  const history = [...(data?.examResults ?? [])].reverse()

  if (run) {
    const questions = examQuestions(level, run.section)
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <p className="label text-soft">{LEVEL_LABEL[level]} · {SECTION_LABEL[run.section][1]} · {run.timed ? 'timed — explanations at the end' : 'untimed practice'}</p>
        <div className="mt-6">
          <ExerciseRunner
            exercises={questions}
            sessionKind="exam"
            deferFeedback={run.timed}
            timeLimitSeconds={run.timed ? questions.length * PACE_SECONDS[run.section] : undefined}
            onFinish={(s) => {
              update.mutate((state) => void state.examResults.push({ id: newId(), level, section: run.section, timed: run.timed, correct: s.correct, total: s.total, seconds: s.seconds, takenAt: new Date().toISOString() }))
              setLast({ ...s, ...run })
              setRun(null)
            }}
          />
        </div>
      </div>
    )
  }

  const weakTypes = new Map<string, { right: number; wrong: number }>()
  for (const a of data?.attempts ?? []) {
    if (!a.conceptKey.startsWith('jlpt.') || a.level !== level) continue
    const row = weakTypes.get(a.conceptLabel) ?? { right: 0, wrong: 0 }
    if (a.isCorrect) row.right++; else row.wrong++
    weakTypes.set(a.conceptLabel, row)
  }

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">試験</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">JLPT Examination Centre</h1>
      <p className="mt-4 max-w-2xl border-l-2 border-blue pl-4 text-sm leading-relaxed text-soft">
        Original practice questions written in the published JLPT question formats. Sets are short — a few questions per section, not a full-length paper — so results show where to revise and are never an official or predicted JLPT score. N2 and N1 are not available yet.
      </p>

      <div className="mt-8 grid max-w-md grid-cols-3 gap-px border border-line bg-line" role="group" aria-label="Level">
        {LEVELS.map((l) => <button key={l} type="button" aria-pressed={l === level} onClick={() => { setLevel(l); setLast(null) }} className={`min-h-14 font-display text-2xl ${l === level ? 'bg-red text-[#f4f0e7]' : 'bg-paper hover:bg-muted'}`}>{l.toUpperCase()}</button>)}
      </div>

      {last && (
        <section className="fade-up mt-8 border-l-4 border-red bg-muted p-5" role="status">
          <p className="label text-soft">{SECTION_LABEL[last.section][1]} — practice result{last.timedOut ? ' (time ran out)' : ''}</p>
          <p className="mt-1 font-display text-5xl tracking-tighter">{last.correct}<span className="text-2xl text-soft"> / {last.total} · {formatDuration(last.seconds)}</span></p>
          {last.missed.length > 0 && (
            <>
              <h2 className="label mt-5 text-soft">Explanations for the questions you missed</h2>
              <ul className="mt-2">
                {last.missed.map((m) => (
                  <li key={m.key} className="border-t border-line py-3">
                    <p className="label text-red">{m.conceptLabel}</p>
                    <p className="mt-1 text-lg"><JP text={m.prompt} /></p>
                    <p className="mt-1 leading-relaxed">{m.kind === 'mcq' ? <><JP text={m.options[0]!.text} className="font-bold" /> — {m.options[0]!.why}</> : <><span lang="ja" className="font-jp font-bold">{m.kind === 'order' ? m.tokens.join('') : m.accept[0]}</span> — {m.why}</>}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <ul className="mt-8">
        {SECTIONS.map((section) => {
          const n = examQuestions(level, section).length
          return (
            <li key={section} className="grid grid-cols-12 items-center gap-y-3 border-t border-ink py-5">
              <div className="col-span-12 md:col-span-6">
                <p lang="ja" className="font-jp text-xl font-bold">{SECTION_LABEL[section][0]}</p>
                <p className="text-soft">{SECTION_LABEL[section][1]}</p>
                <p className="label mt-1 text-soft">{n} questions here · real exam section: {OFFICIAL_MINUTES[level][section]} min</p>
              </div>
              <div className="col-span-12 flex flex-wrap gap-3 md:col-span-6 md:justify-end">
                <button type="button" className="btn btn-solid" onClick={() => { setLast(null); setRun({ section, timed: true }) }}>Timed · {formatDuration(n * PACE_SECONDS[section])}</button>
                <button type="button" className="btn" onClick={() => { setLast(null); setRun({ section, timed: false }) }}>Untimed</button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs text-soft">Timed practice uses a pace of {PACE_SECONDS.vocabulary}s / {PACE_SECONDS['grammar-reading']}s / {PACE_SECONDS.listening}s per question (KOTOBA’s own pacing). Real section times are from the official JLPT site.</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="border-t border-ink pt-4">
          <h2 className="label text-soft">Weak-area analysis — {LEVEL_LABEL[level]}</h2>
          {weakTypes.size === 0 ? <p className="mt-3 text-soft">No exam questions answered at this level yet.</p> : (
            <ul className="mt-2">
              {[...weakTypes.entries()].sort((a, b) => b[1].wrong / (b[1].wrong + b[1].right) - a[1].wrong / (a[1].wrong + a[1].right)).map(([label, r]) => (
                <li key={label} className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                  <span lang="ja" className="font-jp">{label}</span>
                  <span className={`label whitespace-nowrap ${r.wrong > r.right ? 'text-red' : 'text-soft'}`}>{r.right}/{r.right + r.wrong} correct{r.wrong > 0 ? ' · revise' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border-t border-ink pt-4">
          <h2 className="label text-soft">Examination history</h2>
          {history.length === 0 ? <p className="mt-3 text-soft">No practice sections taken yet.</p> : (
            <ul className="mt-2">
              {history.slice(0, 20).map((h) => (
                <li key={h.id} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-line py-2.5">
                  <span>{LEVEL_LABEL[h.level]} · {SECTION_LABEL[h.section as ExamSection]?.[1] ?? h.section}<span className="block text-sm text-soft">{new Date(h.takenAt).toLocaleDateString()} · {h.timed ? 'timed' : 'untimed'} · {formatDuration(h.seconds)}</span></span>
                  <span className="font-display text-2xl">{h.correct}/{h.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
