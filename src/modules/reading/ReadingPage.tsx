import { useState } from 'react'
import { JP } from '@/components/JP'
import { PASSAGES, type Passage } from '@/content/studio'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { useLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL } from '@/modules/learner/types'

export default function ReadingPage() {
  const { data } = useLearner()
  const [passage, setPassage] = useState<Passage | null>(null)
  const [furigana, setFurigana] = useState(true)
  const [open, setOpen] = useState<number | null>(null)
  const [highlight, setHighlight] = useState(false)
  const [quiz, setQuiz] = useState(false)
  const [result, setResult] = useState<RunSummary | null>(null)
  const attempts = data?.attempts ?? []
  const doneCount = (p: Passage) => p.questions.filter((q) => attempts.some((a) => a.exerciseKey === q.key && a.isCorrect)).length

  if (!passage) {
    return (
      <div className="px-5 py-8 md:px-10 md:py-12">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">読む</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Reading Studio</h1>
        <p className="mt-3 max-w-xl text-soft">Graded passages, easiest first. Read without translation first; open a sentence only when you are stuck.</p>
        <ul className="mt-8">
          {PASSAGES.map((p) => (
            <li key={p.slug} className="border-t border-ink">
              <button type="button" onClick={() => { setPassage(p); setOpen(null); setQuiz(false); setResult(null) }} className="grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 text-left hover:bg-muted">
                <span className="label w-20 text-red">{LEVEL_LABEL[p.level]}</span>
                <span className="text-2xl font-bold"><JP text={p.title} /></span>
                <span className="label text-soft">{doneCount(p)}/{p.questions.length} answered correctly</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-l-2 border-blue pl-3 text-xs leading-relaxed text-soft">Original passages written for KOTOBA; not yet reviewed by a native-speaking teacher.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <button type="button" className="label min-h-11 text-soft" onClick={() => setPassage(null)}>← Reading Studio</button>
      <p className="label mt-4 text-red">{LEVEL_LABEL[passage.level]}</p>
      <h1 className="mt-2 text-4xl font-black"><JP text={passage.title} furigana={furigana} className="!font-jp-serif" /></h1>

      {quiz ? (
        <div className="mt-8"><ExerciseRunner exercises={passage.questions} sessionKind="reading" onFinish={(s) => { setResult(s); setQuiz(false) }} /></div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-5">
            <button type="button" className="label min-h-11 border-b border-ink" aria-pressed={furigana} onClick={() => setFurigana(!furigana)}>Furigana: {furigana ? 'on' : 'off'}</button>
            <button type="button" className="label min-h-11 border-b border-ink" aria-pressed={highlight} onClick={() => setHighlight(!highlight)}>Vocabulary list: {highlight ? 'shown' : 'hidden'}</button>
          </div>
          <div className="mt-4 border-t border-ink pt-4">
            {passage.sentences.map((s, i) => (
              <div key={i} className="border-b border-line">
                <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full py-2 text-left text-2xl leading-[2.3] hover:bg-muted">
                  <JP text={s.jp} furigana={furigana} />
                </button>
                {open === i && <p className="fade-up mb-3 border-l-4 border-red bg-muted p-3 text-soft">{s.en}</p>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-soft">Tap a sentence to reveal its meaning.</p>

          {highlight && (
            <dl className="fade-up mt-6 grid gap-x-8 sm:grid-cols-2">
              {passage.glossary.map(([w, r, m]) => (
                <div key={w} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                  <dt lang="ja" className="font-jp text-lg font-bold">{w} <span className="text-sm font-normal text-soft">{r}</span></dt><dd className="text-right text-soft">{m}</dd>
                </div>
              ))}
            </dl>
          )}

          {result && <p className="mt-6 border-l-4 border-red bg-muted p-4" role="status">Comprehension: {result.correct} of {result.total} correct.</p>}
          <button type="button" className="btn btn-solid mt-8" onClick={() => setQuiz(true)}>Comprehension questions <span aria-hidden>→</span></button>
        </>
      )}
    </div>
  )
}
