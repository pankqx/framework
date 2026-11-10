import { useRef, useState } from 'react'
import { LEVEL_LABEL, type AssessmentResult, type Attempt, type Session } from '@/modules/learner/types'
import { newId } from '@/lib/id'
import { BANDS, nextBand, placeLevel, questionsForBand, scoreBand, type BandScore, type PlacementBand } from './placement'

export interface PlacementOutcome {
  result: AssessmentResult
  attempts: Attempt[]
  session: Session
}

const DONT_KNOW = '__unknown__'

export function Placement({ onDone }: { onDone: (outcome: PlacementOutcome) => void }) {
  const startedAt = useRef(new Date().toISOString())
  const [band, setBand] = useState<PlacementBand>(BANDS[0]!)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [bands, setBands] = useState<BandScore[]>([])

  const questions = questionsForBand(band)
  const question = questions[index]!
  const revealed = picked !== null
  const correct = picked === question.answerId
  const right = question.options.find((o) => o.id === question.answerId)!
  const chosen = question.options.find((o) => o.id === picked)

  const choose = (id: string) => {
    if (revealed) return
    setPicked(id)
    const response = id === DONT_KNOW ? null : id
    setAnswers((a) => ({ ...a, [question.key]: response }))
    setAttempts((list) => [
      ...list,
      {
        id: newId(),
        exerciseKey: `placement:${question.key}`,
        conceptKey: question.conceptKey,
        conceptLabel: question.conceptLabel,
        skill: question.skill,
        level: question.level,
        response: question.options.find((o) => o.id === id)?.text ?? null,
        isCorrect: id === question.answerId,
        attemptedAt: new Date().toISOString(),
      },
    ])
  }

  const advance = () => {
    setPicked(null)
    if (index + 1 < questions.length) return setIndex(index + 1)
    const scored = [...bands, scoreBand(band, answers)]
    const following = nextBand(scored)
    if (following) {
      setBands(scored)
      setBand(following)
      setIndex(0)
      return
    }
    const endedAt = new Date().toISOString()
    onDone({
      attempts,
      session: { id: newId(), kind: 'placement', startedAt: startedAt.current, endedAt },
      result: { id: newId(), kind: 'placement', takenAt: endedAt, placedLevel: placeLevel(scored), bands: scored },
    })
  }

  return (
    <div className="fade-up" key={question.key}>
      <div className="flex items-baseline justify-between border-t border-ink pt-3">
        <p className="label text-red">{LEVEL_LABEL[band]}</p>
        <p className="label text-soft" aria-label={`Question ${index + 1} of ${questions.length} in this stage`}>
          {index + 1} / {questions.length}
        </p>
      </div>

      <p className="mt-8 text-soft">{question.instruction}</p>
      <p lang={/^[a-z ]+$/i.test(question.prompt) ? 'en' : 'ja'} className="mt-3 font-jp-serif text-4xl leading-snug font-black break-words md:text-5xl">
        {question.prompt}
      </p>

      <div role="group" aria-label="Answer choices" className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
        {question.options.map((o) => {
          const isRight = o.id === question.answerId
          const isPicked = o.id === picked
          const tone = !revealed
            ? 'bg-paper hover:bg-muted'
            : isRight
              ? 'bg-ink text-paper'
              : isPicked
                ? 'bg-red text-[#f4f0e7]'
                : 'bg-paper opacity-50'
          return (
            <button key={o.id} type="button" disabled={revealed} onClick={() => choose(o.id)} className={`flex min-h-16 items-center justify-between gap-3 px-4 py-3 text-left font-jp text-xl transition-colors ${tone}`}>
              <span lang="ja">{o.text}</span>
              {revealed && isRight && <span className="label">Correct</span>}
              {revealed && isPicked && !isRight && <span className="label">Your answer</span>}
            </button>
          )
        })}
      </div>

      {!revealed && (
        <button type="button" onClick={() => choose(DONT_KNOW)} className="label mt-4 min-h-11 border-b border-line text-soft hover:border-ink hover:text-ink">
          I don’t know this yet — no guessing
        </button>
      )}

      {revealed && (
        <div className="fade-up mt-6 border-l-4 border-red bg-muted p-5" aria-live="polite">
          <p className="label">{correct ? 'Correct — here is why' : picked === DONT_KNOW ? 'Noted — here is how it works' : 'Not quite — here is why'}</p>
          {chosen && !correct && (
            <p className="mt-3 leading-relaxed">
              <span lang="ja" className="font-jp font-bold">{chosen.text}</span> — {chosen.why}
            </p>
          )}
          <p className="mt-3 leading-relaxed">
            <span lang="ja" className="font-jp font-bold">{right.text}</span> — {right.why}
          </p>
          <p className="label mt-4 text-soft">Concept · {question.conceptLabel}</p>
          <button type="button" autoFocus onClick={advance} className="btn btn-solid mt-5">
            Next <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
