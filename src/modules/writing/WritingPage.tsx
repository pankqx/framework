import { useState } from 'react'
import { JP } from '@/components/JP'
import { DIARY_PROMPTS, TYPING_DRILLS } from '@/content/studio'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { newId } from '@/lib/id'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { askSensei, buildContext, senseiEndpointConfigured } from '@/modules/sensei/client'

const JAPANESE = /[぀-ヿ一-龯]/g

export default function WritingPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [drill, setDrill] = useState(false)
  const [result, setResult] = useState<RunSummary | null>(null)
  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState(0)
  const [feedback, setFeedback] = useState<{ id: string; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!data) return null
  const japaneseChars = (text.match(JAPANESE) ?? []).length
  const diary = [...data.diary].reverse()

  const save = () => {
    update.mutate((state) => {
      const now = new Date().toISOString()
      state.diary.push({ id: newId(), text: text.trim(), writtenAt: now })
      state.sessions.push({ id: newId(), kind: 'writing', startedAt: now, endedAt: now })
    })
    setText('')
  }
  const getFeedback = async (id: string, entry: string) => {
    setBusy(true); setError(null); setFeedback(null)
    const reply = await askSensei('correction', buildContext(data), [{ role: 'user', content: entry }])
    setBusy(false)
    if (reply.ok) setFeedback({ id, text: reply.text })
    else setError('Sensei could not be reached, so no feedback was generated.')
  }

  if (drill) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <button type="button" className="label mb-6 min-h-11 text-soft" onClick={() => setDrill(false)}>← Writing Studio</button>
        <ExerciseRunner exercises={TYPING_DRILLS} sessionKind="writing" onFinish={(s) => { setResult(s); setDrill(false) }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">書く</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Writing Studio</h1>

      <section className="mt-8 border-t border-ink pt-4">
        <h2 className="font-display text-2xl tracking-tight">Typing and sentence construction</h2>
        <p className="mt-2 leading-relaxed text-soft">{TYPING_DRILLS.length} sentences to type in Japanese, checked exactly (kana or kanji accepted). You need a Japanese keyboard or IME enabled on your device.</p>
        {result && <p className="mt-4 border-l-4 border-red bg-muted p-4" role="status">Typing: {result.correct} of {result.total} correct.</p>}
        <button type="button" className="btn btn-solid mt-4" onClick={() => { setResult(null); setDrill(true) }}>Start typing practice <span aria-hidden>→</span></button>
      </section>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="font-display text-2xl tracking-tight">Diary — 日記</h2>
        <p className="mt-3 text-xl"><JP text={DIARY_PROMPTS[prompt]!} /></p>
        <button type="button" className="label min-h-11 border-b border-line text-soft" onClick={() => setPrompt((prompt + 1) % DIARY_PROMPTS.length)}>Another prompt</button>
        <label className="sr-only" htmlFor="diary">Diary entry</label>
        <textarea id="diary" lang="ja" rows={5} value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} className="mt-3 w-full resize-y border border-ink bg-transparent p-3 font-jp text-xl leading-relaxed outline-none focus:border-red" placeholder="日本語で書いてください" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="label text-soft">{japaneseChars} Japanese characters</p>
          <button type="button" className="btn" disabled={japaneseChars === 0} onClick={save}>Save entry</button>
        </div>
        <p className="mt-3 border-l-2 border-blue pl-3 text-sm leading-relaxed text-soft">
          {senseiEndpointConfigured ? 'Saved entries can be sent to AI Sensei for correction and more natural alternatives.' : 'Writing feedback and natural-expression suggestions need AI Sensei, which is not connected in this build. Entries are saved; nothing is corrected automatically.'}
        </p>

        {diary.length > 0 && (
          <ul className="mt-6">
            {diary.map((d) => (
              <li key={d.id} className="border-t border-line py-4">
                <p className="label text-soft">{new Date(d.writtenAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p lang="ja" className="mt-1 font-jp text-lg leading-relaxed whitespace-pre-wrap">{d.text}</p>
                {senseiEndpointConfigured && <button type="button" className="label mt-2 min-h-11 border-b border-ink" disabled={busy} onClick={() => getFeedback(d.id, d.text)}>{busy ? 'Asking Sensei…' : 'Get feedback from Sensei'}</button>}
                {feedback?.id === d.id && <p className="fade-up mt-3 border-l-4 border-red bg-muted p-4 leading-relaxed whitespace-pre-wrap">{feedback.text}</p>}
              </li>
            ))}
          </ul>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-red">{error}</p>}
      </section>
    </div>
  )
}
