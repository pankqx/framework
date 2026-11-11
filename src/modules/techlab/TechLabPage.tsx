import { useState } from 'react'
import { TECH_EXERCISES, TECH_RESPONSES, TECH_VOCAB } from '@/content/techlab'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { newCard } from '@/modules/revision/srs'

export default function TechLabPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunSummary | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const have = new Set((data?.cards ?? []).map((c) => c.conceptKey))
  const allTerms = TECH_VOCAB.flatMap((g) => g.items)
  const missing = allTerms.filter(([t]) => !have.has(`vocab:${t}`))

  if (running) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <button type="button" className="label mb-6 min-h-11 text-soft" onClick={() => setRunning(false)}>← Tech Lab</button>
        <ExerciseRunner exercises={TECH_EXERCISES} sessionKind="tech" onFinish={(s) => { setResult(s); setRunning(false) }} />
      </div>
    )
  }

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">技術</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">KOTOBA <em className="text-blue">Tech Lab</em></h1>
      <p className="mt-3 max-w-2xl text-soft">Japanese through software engineering. Code keeps its real syntax — keywords are never translated; only comments, documentation and messages are in Japanese. Best from around N4 upward.</p>

      <section className="mt-8 border-t border-ink pt-4">
        <h2 className="font-display text-2xl tracking-tight">Read, understand, explain</h2>
        <p className="mt-2 text-soft">{TECH_EXERCISES.length} exercises: code comments, API documentation, error messages, setup instructions and interview questions.</p>
        {result && <p className="mt-4 border-l-4 border-red bg-muted p-4" role="status">Tech Lab: {result.correct} of {result.total} correct.</p>}
        <button type="button" className="btn btn-solid mt-4" onClick={() => { setResult(null); setRunning(true) }}>Start exercises <span aria-hidden>→</span></button>
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Technical vocabulary</h2>
          <button type="button" className="btn" disabled={missing.length === 0} onClick={() => update.mutate((s) => { const now = new Date(); for (const [t, r, m] of missing) s.cards.push(newCard('vocabulary', `vocab:${t}`, t, m, now, r)) })}>
            {missing.length ? `Add ${missing.length} terms to revision` : 'All terms in your revision deck'}
          </button>
        </div>
        <div className="mt-4 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {TECH_VOCAB.map((g) => (
            <div key={g.group}>
              <h3 className="label text-red">{g.group}</h3>
              <dl className="mt-2">
                {g.items.map(([t, r, m]) => (
                  <div key={t} className="grid grid-cols-[1fr_1fr_1fr] items-baseline gap-2 border-b border-line py-2">
                    <dt lang="ja" className="font-jp text-lg font-bold">{t}</dt><dd lang="ja" className="font-jp text-sm text-soft">{r}</dd><dd className="text-right">{m}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="font-display text-2xl tracking-tight">Respond in Japanese</h2>
        <p className="mt-2 text-sm text-soft">Write your answer, then compare it with a model answer. These are self-checked: there are many correct ways to say each one, so KOTOBA does not mark them.</p>
        {TECH_RESPONSES.map((t, i) => (
          <div key={i} className="mt-6 border-l-4 border-ink pl-4">
            <p lang="ja" className="font-jp text-xl font-bold">{t.instruction}</p>
            <p className="mt-1 text-soft">{t.en}</p>
            <label className="sr-only" htmlFor={`tr-${i}`}>Your answer</label>
            <textarea id={`tr-${i}`} lang="ja" rows={2} value={answers[i] ?? ''} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })} className="mt-3 w-full border border-ink bg-transparent p-3 font-jp text-lg outline-none focus:border-red" placeholder="日本語で答えてください" />
            <button type="button" className="label mt-1 min-h-11 border-b border-ink" disabled={!(answers[i] ?? '').trim()} onClick={() => setShown({ ...shown, [i]: true })}>Show a model answer</button>
            {shown[i] && <p lang="ja" className="fade-up mt-2 bg-muted p-3 font-jp text-lg">{t.model}</p>}
          </div>
        ))}
      </section>
    </div>
  )
}
