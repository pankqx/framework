import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { JP } from '@/components/JP'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { lessonBySlug, LESSONS, isCompleted } from '@/content/lessons'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL } from '@/modules/learner/types'
import { cardsFromLesson } from '@/modules/revision/srs'
import { LESSON_PROVENANCE, passMark, type Lesson } from './types'

type Stage = 'study' | 'practice' | 'apply' | 'assessment' | 'result'
const STAGES: [Stage, string][] = [['study', 'Learn'], ['practice', 'Practise'], ['apply', 'Apply'], ['assessment', 'Check'], ['result', 'Summary']]

export default function LessonPage() {
  const { slug = '' } = useParams()
  const lesson = lessonBySlug(slug)
  if (!lesson) return <Navigate to="/app/curriculum" replace />
  return <LessonView key={lesson.slug} lesson={lesson} />
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [stage, setStage] = useState<Stage>('study')
  const [practice, setPractice] = useState<RunSummary | null>(null)
  const [result, setResult] = useState<RunSummary | null>(null)
  const [cardsAdded, setCardsAdded] = useState(0)
  const [attemptNo, setAttemptNo] = useState(0)
  const [furigana, setFurigana] = useState(true)

  const done = isCompleted(lesson.slug, data?.lessonCompletions ?? [])
  const needed = passMark(lesson.assessment.length)
  const passed = result ? result.correct >= needed : false
  const following = LESSONS[LESSONS.findIndex((l) => l.slug === lesson.slug) + 1]

  const finishAssessment = (summary: RunSummary) => {
    setResult(summary)
    setStage('result')
    if (summary.correct < needed) return
    update.mutate((state) => {
      const now = new Date()
      state.lessonCompletions.push({ slug: lesson.slug, completedAt: now.toISOString(), correct: summary.correct, total: summary.total })
      const fresh = cardsFromLesson(lesson, state.cards, now)
      state.cards.push(...fresh)
      setCardsAdded(fresh.length)
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <Link to="/app/curriculum" className="label text-soft hover:text-red">← Curriculum</Link>
      <header className="mt-6">
        <p className="label text-red">{LEVEL_LABEL[lesson.level]} · {lesson.minutes} min{done ? ' · completed' : ''}</p>
        <p lang="ja" className="mt-3 font-jp-serif text-5xl leading-tight font-black break-words md:text-6xl">{lesson.jp}</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{lesson.title}</h1>
      </header>

      <ol className="mt-8 grid grid-cols-5 gap-1" aria-label="Lesson stages">
        {STAGES.map(([key, label], i) => {
          const at = STAGES.findIndex(([k]) => k === stage)
          return (
            <li key={key} aria-current={key === stage ? 'step' : undefined}>
              <span className={`block h-1 ${i <= at ? 'bg-red' : 'bg-line'}`} />
              <span className={`label mt-2 block ${key === stage ? '' : 'text-soft'}`}>{label}</span>
            </li>
          )
        })}
      </ol>

      <div className="fade-up mt-10" key={`${stage}-${attemptNo}`}>
        {stage === 'study' && (
          <>
            <section className="border-l-4 border-red bg-muted p-5">
              <h2 className="label text-soft">Learning objective</h2>
              <p className="mt-2 font-display text-2xl leading-snug tracking-tight">{lesson.objective}</p>
            </section>
            <p className="mt-8 text-lg leading-relaxed">{lesson.intro}</p>

            <div className="mt-6 flex justify-end">
              <button type="button" className="label min-h-11 border-b border-line" aria-pressed={furigana} onClick={() => setFurigana(!furigana)}>Furigana: {furigana ? 'on' : 'off'}</button>
            </div>

            {lesson.sections.map((section) => (
              <section key={section.heading} className="mt-8 border-t border-ink pt-4">
                <h2 className="font-display text-2xl tracking-tight">{section.heading}</h2>
                {section.body.map((p) => <p key={p} className="mt-3 leading-relaxed"><JP text={p} furigana={furigana} className="!font-sans" /></p>)}
                {section.examples && (
                  <ul className="mt-5">
                    {section.examples.map((ex) => (
                      <li key={ex.jp} className="border-b border-line py-3">
                        <p className="text-2xl leading-[2.1]"><JP text={ex.jp} furigana={furigana} /></p>
                        <p className="text-soft">{ex.en}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {lesson.grammar.length > 0 && (
              <section className="mt-10 border-t border-ink pt-4">
                <h2 className="label text-soft">Grammar</h2>
                <dl className="mt-3">
                  {lesson.grammar.map((g) => (
                    <div key={g.pattern} className="grid gap-x-6 border-b border-line py-3 sm:grid-cols-[2fr_3fr]">
                      <dt lang="ja" className="font-jp text-lg font-bold">{g.pattern}</dt>
                      <dd>{g.meaning}<span className="block text-sm text-soft">{g.note}</span></dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {lesson.vocab.length > 0 && (
              <section className="mt-10 border-t border-ink pt-4">
                <h2 className="label text-soft">Vocabulary</h2>
                <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  {lesson.vocab.map((v) => (
                    <div key={v.term} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                      <dt className="text-xl"><JP text={v.term} furigana={furigana} className="font-bold" /></dt>
                      <dd className="text-right text-soft">{v.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <p className="mt-10 border-l-2 border-blue pl-3 text-xs leading-relaxed text-soft">{LESSON_PROVENANCE}</p>
            <button type="button" className="btn btn-solid mt-8" onClick={() => setStage('practice')}>Practise <span aria-hidden>→</span></button>
          </>
        )}

        {stage === 'practice' && (
          <ExerciseRunner exercises={lesson.practice} sessionKind="lesson" onFinish={(s) => { setPractice(s); setStage('apply') }} />
        )}

        {stage === 'apply' && (
          <section>
            {practice && <p className="label text-soft">Practice: {practice.correct} of {practice.total} correct</p>}
            <h2 className="mt-4 font-display text-3xl tracking-tight">Use it</h2>
            <p className="mt-4 border-l-4 border-ink bg-muted p-5 text-lg leading-relaxed"><JP text={lesson.application} className="!font-sans" /></p>
            <p className="mt-4 text-sm leading-relaxed text-soft">This task is yours to do aloud or on paper; it is not marked. For feedback on sentences you write, use the Writing studio or AI Sensei.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn btn-solid" onClick={() => setStage('assessment')}>Take the check <span aria-hidden>→</span></button>
              <button type="button" className="btn" onClick={() => setStage('study')}>Review the lesson</button>
            </div>
          </section>
        )}

        {stage === 'assessment' && (
          <>
            <p className="mb-6 text-sm text-soft">Mini assessment — {needed} of {lesson.assessment.length} needed to complete the lesson.</p>
            <ExerciseRunner exercises={lesson.assessment} sessionKind="lesson" onFinish={finishAssessment} />
          </>
        )}

        {stage === 'result' && result && (
          <section>
            <p className="label text-soft">Mini assessment</p>
            <p className="mt-2 font-display text-7xl tracking-tighter">{result.correct}<span className="text-3xl text-soft"> / {result.total}</span></p>
            <h2 className={`mt-4 font-display text-3xl tracking-tight ${passed ? '' : 'text-red'}`}>{passed ? 'Lesson completed' : 'Not yet — review and try again'}</h2>

            <h3 className="label mt-8 text-soft">Summary</h3>
            <ul className="mt-2">
              {lesson.summary.map((s) => <li key={s} className="border-b border-line py-2.5"><JP text={s} className="!font-sans" /></li>)}
            </ul>

            <h3 className="label mt-8 text-soft">Revision recommendation</h3>
            <div className="mt-2 leading-relaxed">
              {result.missed.length > 0 ? (
                <>
                  <p>You missed {result.missed.length === 1 ? 'this concept' : 'these concepts'}; {result.missed.length === 1 ? 'it is' : 'they are'} now listed under weak concepts on your dashboard:</p>
                  <ul className="mt-2">{[...new Set(result.missed.map((m) => m.conceptLabel))].map((c) => <li key={c} lang="ja" className="font-jp font-bold">· {c}</li>)}</ul>
                </>
              ) : <p>Every item correct. That shows you understood it today — it only becomes mastered through spaced recall.</p>}
              {passed && (
                <p className="mt-3">{cardsAdded > 0 ? `${cardsAdded} revision card${cardsAdded === 1 ? '' : 's'} added and due now.` : lesson.vocab.length + lesson.grammar.length > 0 ? 'Cards for this lesson are already in your revision deck.' : 'This lesson adds no revision cards; repeat it tomorrow to check recall.'}</p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {passed ? (
                <>
                  {cardsAdded > 0 && <Link to="/app/review" className="btn btn-solid">Review cards <span aria-hidden>→</span></Link>}
                  {following && <Link to={`/app/lesson/${following.slug}`} className={`btn ${cardsAdded > 0 ? '' : 'btn-solid'}`}>Next lesson <span aria-hidden>→</span></Link>}
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-solid" onClick={() => { setResult(null); setStage('study') }}>Review the lesson</button>
                  <button type="button" className="btn" onClick={() => { setResult(null); setAttemptNo(attemptNo + 1); setStage('assessment') }}>Retry the check</button>
                </>
              )}
              <Link to="/app" className="btn">Dashboard</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
