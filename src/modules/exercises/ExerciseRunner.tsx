import { useEffect, useMemo, useRef, useState } from 'react'
import { JP } from '@/components/JP'
import { AudioButton } from '@/components/AudioButton'
import { newId } from '@/lib/id'
import { useUpdateLearner } from '@/modules/learner/hooks'
import type { Attempt, Session } from '@/modules/learner/types'
import { isCorrect, responseText, scrambled, shuffled, type Response } from './evaluate'
import type { Exercise } from './types'

export interface RunSummary {
  correct: number
  total: number
  seconds: number
  timedOut: boolean
  missed: Exercise[]
}

/**
 * Runs a set of exercises: evaluates each answer, explains why, and records
 * every attempt (and the study session) as it happens — so weaknesses are
 * captured even if the learner leaves halfway.
 */
export function ExerciseRunner({
  exercises,
  sessionKind,
  onFinish,
  timeLimitSeconds,
  deferFeedback = false,
}: {
  exercises: Exercise[]
  sessionKind: Session['kind']
  onFinish: (summary: RunSummary) => void
  timeLimitSeconds?: number
  /** Exam mode: no explanation until the end. */
  deferFeedback?: boolean
}) {
  const update = useUpdateLearner()
  const startedAt = useRef(Date.now())
  const sessionId = useRef(newId())
  const [index, setIndex] = useState(0)
  const [response, setResponse] = useState<Response | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [built, setBuilt] = useState<number[]>([])
  const [text, setText] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const [remaining, setRemaining] = useState(timeLimitSeconds ?? 0)
  const finished = useRef(false)

  const exercise = exercises[index]!
  const options = useMemo(() => (exercise.kind === 'mcq' ? shuffled(exercise.options, exercise.key) : []), [exercise])
  const bank = useMemo(() => (exercise.kind === 'order' ? scrambled(exercise.tokens.map((t, i) => ({ t, i })), exercise.key) : []), [exercise])

  const finish = (all: boolean[], timedOut: boolean) => {
    if (finished.current) return
    finished.current = true
    onFinish({
      correct: all.filter(Boolean).length,
      total: exercises.length,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      timedOut,
      missed: exercises.filter((_, i) => !all[i]),
    })
  }

  useEffect(() => {
    if (!timeLimitSeconds) return
    const t = setInterval(() => {
      const left = timeLimitSeconds - Math.floor((Date.now() - startedAt.current) / 1000)
      setRemaining(Math.max(0, left))
      if (left <= 0) {
        clearInterval(t)
        setResults((r) => (finish(r, true), r))
      }
    }, 500)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitSeconds])

  const record = (r: Response, correct: boolean) => {
    const now = new Date().toISOString()
    const attempt: Attempt = {
      id: newId(), exerciseKey: exercise.key, conceptKey: exercise.conceptKey, conceptLabel: exercise.conceptLabel,
      skill: exercise.skill, level: exercise.level, response: responseText(r), isCorrect: correct, attemptedAt: now,
    }
    update.mutate((state) => {
      state.attempts.push(attempt)
      const session = state.sessions.find((s) => s.id === sessionId.current)
      if (session) session.endedAt = now
      else state.sessions.push({ id: sessionId.current, kind: sessionKind, startedAt: new Date(startedAt.current).toISOString(), endedAt: now })
    })
  }

  const next = (all: boolean[]) => {
    setResponse(null)
    setBuilt([])
    setText('')
    setShowTranscript(false)
    if (index + 1 < exercises.length) setIndex(index + 1)
    else finish(all, false)
  }

  const answer = (r: Response) => {
    if (response) return
    const correct = isCorrect(exercise, r)
    const all = [...results, correct]
    setResults(all)
    record(r, correct)
    if (deferFeedback) next(all)
    else setResponse(r)
  }

  const correct = response ? isCorrect(exercise, response) : false
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div>
      <div className="flex items-baseline justify-between border-t border-ink pt-3">
        <p className="label text-red">{exercise.conceptLabel}</p>
        <p className="label text-soft">
          {timeLimitSeconds ? <span className={remaining < 30 ? 'text-red' : ''} aria-label="Time remaining">{mm}:{ss} · </span> : null}
          {index + 1} / {exercises.length}
        </p>
      </div>
      <div className="mt-1 h-0.5 bg-line" aria-hidden><div className="h-full bg-red transition-[width] duration-500" style={{ width: `${(index / exercises.length) * 100}%` }} /></div>

      <div className="fade-up" key={exercise.key}>
        {exercise.passage && (
          <div className="mt-6 border-l-4 border-ink bg-muted p-5 text-xl leading-[2.4]"><JP text={exercise.passage} /></div>
        )}
        {exercise.audio && (
          <div className="mt-6">
            <AudioButton text={exercise.audio} label="Play audio" />
            {(response || !deferFeedback) && (
              <div className="mt-3">
                {showTranscript || response ? <p className="font-jp text-lg" lang="ja">{exercise.audio}</p> : <button type="button" className="label min-h-11 border-b border-line text-soft" onClick={() => setShowTranscript(true)}>Reveal transcript</button>}
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-soft">{exercise.instruction}</p>
        <p className="mt-2 text-3xl leading-snug font-bold break-words md:text-4xl"><JP text={exercise.prompt} className="!font-jp-serif" /></p>

        {exercise.kind === 'mcq' && (
          <div role="group" aria-label="Answer choices" className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
            {options.map((o) => {
              const right = o.text === exercise.options[0]!.text
              const picked = response?.kind === 'mcq' && response.text === o.text
              const tone = !response ? 'bg-paper hover:bg-muted' : right ? 'bg-ink text-paper' : picked ? 'bg-red text-[#f4f0e7]' : 'bg-paper opacity-50'
              return (
                <button key={o.text} type="button" disabled={!!response} onClick={() => answer({ kind: 'mcq', text: o.text })} className={`flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-left text-lg transition-colors ${tone}`}>
                  <JP text={o.text} />
                  {response && right && <span className="label">Correct</span>}
                  {picked && !right && <span className="label">Your answer</span>}
                </button>
              )
            })}
          </div>
        )}

        {exercise.kind === 'order' && (
          <div className="mt-6">
            <div className="flex min-h-16 flex-wrap items-center gap-2 border-b-2 border-ink pb-3" aria-label="Your sentence" aria-live="polite">
              {built.length === 0 && <span className="text-soft">Tap the words below in order.</span>}
              {built.map((bi) => (
                <button key={bi} type="button" disabled={!!response} onClick={() => setBuilt(built.filter((x) => x !== bi))} className="min-h-11 bg-ink px-3 font-jp text-xl text-paper" lang="ja">{exercise.tokens[bi]}</button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {bank.filter(({ i }) => !built.includes(i)).map(({ t, i }) => (
                <button key={i} type="button" disabled={!!response} onClick={() => setBuilt([...built, i])} className="min-h-11 border border-ink px-3 font-jp text-xl hover:bg-muted" lang="ja">{t}</button>
              ))}
            </div>
            {!response && <button type="button" className="btn btn-solid mt-5" disabled={built.length !== exercise.tokens.length} onClick={() => answer({ kind: 'order', tokens: built.map((bi) => exercise.tokens[bi]!) })}>Check</button>}
          </div>
        )}

        {exercise.kind === 'type' && (
          <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (text.trim()) answer({ kind: 'type', text }) }}>
            <label className="label text-soft" htmlFor={`in-${exercise.key}`}>Your answer</label>
            <input id={`in-${exercise.key}`} autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={!!response} value={text} onChange={(e) => setText(e.target.value)} className="mt-2 w-full border-b-2 border-ink bg-transparent py-2 font-jp text-3xl outline-none focus:border-red" />
            {!response && <button type="submit" className="btn btn-solid mt-5" disabled={!text.trim()}>Check</button>}
          </form>
        )}

        {!response && exercise.kind === 'mcq' && (
          <button type="button" onClick={() => answer({ kind: 'mcq', text: null })} className="label mt-4 min-h-11 border-b border-line text-soft hover:border-ink hover:text-ink">I don’t know this yet</button>
        )}

        {response && (
          <div className="fade-up mt-6 border-l-4 border-red bg-muted p-5" aria-live="polite">
            <p className="label">{correct ? 'Correct — here is why' : 'Not quite — here is why'}</p>
            {exercise.kind === 'mcq' ? (
              <>
                {response.kind === 'mcq' && response.text && !correct && (
                  <p className="mt-3 leading-relaxed"><JP text={response.text} className="font-bold" /> — {exercise.options.find((o) => o.text === response.text)?.why}</p>
                )}
                <p className="mt-3 leading-relaxed"><JP text={exercise.options[0]!.text} className="font-bold" /> — {exercise.options[0]!.why}</p>
              </>
            ) : (
              <>
                {!correct && <p className="mt-3 leading-relaxed">Your answer: <span lang="ja" className="font-jp font-bold">{responseText(response)}</span></p>}
                <p className="mt-3 leading-relaxed">Answer: <span lang="ja" className="font-jp font-bold">{exercise.kind === 'order' ? exercise.tokens.join('') : exercise.accept[0]}</span></p>
                <p className="mt-2 leading-relaxed">{exercise.why}</p>
              </>
            )}
            <button type="button" autoFocus onClick={() => next(results)} className="btn btn-solid mt-5">{index + 1 < exercises.length ? 'Next' : 'Finish'} <span aria-hidden>→</span></button>
          </div>
        )}
      </div>
    </div>
  )
}
