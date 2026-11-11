import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SenseiMode } from '../../../supabase/functions/_shared/prompt'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import type { Exercise } from '@/modules/exercises/types'
import { newId } from '@/lib/id'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import type { ChatMessage } from '@/modules/learner/types'
import { askSensei, buildContext, challengeFromWeaknesses, searchReference, senseiEndpointConfigured, type SenseiReply } from './client'

const MODES: { id: SenseiMode; jp: string; label: string; placeholder: string }[] = [
  { id: 'teach', jp: '教', label: 'Teach', placeholder: 'What should Sensei teach? e.g. the difference between は and が' },
  { id: 'ask', jp: '問', label: 'Ask', placeholder: 'Ask a question about Japanese' },
  { id: 'correction', jp: '直', label: 'Correction', placeholder: '直してほしい文を書いてください — write a sentence to be corrected' },
  { id: 'conversation', jp: '話', label: 'Conversation', placeholder: 'Set a scene, e.g. ordering at a café' },
  { id: 'immersion', jp: '浸', label: 'Immersion', placeholder: '日本語で話しましょう' },
  { id: 'challenge', jp: '挑', label: 'Challenge', placeholder: 'Say “start” for exercises on your weak points' },
  { id: 'grammar', jp: '文', label: 'Grammar', placeholder: 'Paste a sentence to break down' },
  { id: 'reading', jp: '読', label: 'Reading', placeholder: 'Paste a passage to read together' },
]

const FAILURE: Record<Exclude<SenseiReply, { ok: true }>['reason'], string> = {
  'not-configured': 'AI Sensei is not connected in this build.',
  'function-not-configured': 'The app reached Supabase, but the sensei function is not deployed or its AI secrets are not set.',
  network: 'Could not reach the Sensei service. Check your connection.',
  provider: 'The AI provider returned an error. Nothing was generated.',
  invalid: 'The request was rejected.',
}

export default function SenseiPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [mode, setMode] = useState<SenseiMode>('teach')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [challenge, setChallenge] = useState<Exercise[] | null>(null)
  const [challengeResult, setChallengeResult] = useState<RunSummary | null>(null)
  const conversationId = useRef(newId())
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => endRef.current?.scrollIntoView({ block: 'nearest' }), [messages, busy])
  if (!data) return null
  const context = buildContext(data)
  const active = MODES.find((m) => m.id === mode)!
  const weakExercises = challengeFromWeaknesses(data)
  const hits = searchReference(query)

  const switchMode = (m: SenseiMode) => { setMode(m); setMessages([]); setError(null); conversationId.current = newId() }

  const send = async () => {
    const content = draft.trim()
    if (!content || busy) return
    const history = [...messages, { role: 'user' as const, content, at: new Date().toISOString() }]
    setMessages(history); setDraft(''); setBusy(true); setError(null)
    const reply = await askSensei(mode, context, history.map(({ role, content }) => ({ role, content })))
    setBusy(false)
    if (!reply.ok) return setError(`${FAILURE[reply.reason]}${reply.detail ? ` (${reply.detail})` : ''}`)
    const full = [...history, { role: 'assistant' as const, content: reply.text, at: new Date().toISOString() }]
    setMessages(full)
    update.mutate((state) => {
      const existing = state.conversations.find((c) => c.id === conversationId.current)
      if (existing) existing.messages = full
      else state.conversations.push({ id: conversationId.current, mode, createdAt: full[0]!.at, messages: full })
      if (state.conversations.length > 30) state.conversations.splice(0, state.conversations.length - 30)
    })
  }

  if (challenge) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <button type="button" className="label mb-6 min-h-11 text-soft" onClick={() => setChallenge(null)}>← Sensei</button>
        <ExerciseRunner exercises={challenge} sessionKind="practice" onFinish={(s) => { setChallengeResult(s); setChallenge(null) }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12">
      <header className="pb-6">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">先生</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">AI Sensei</h1>
      </header>

      <div role="tablist" aria-label="Sensei mode" className="grid grid-cols-4 gap-px border border-line bg-line sm:grid-cols-8">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={m.id === mode} type="button" onClick={() => switchMode(m.id)} className={`min-h-16 py-2 text-center ${m.id === mode ? 'bg-ink text-paper' : 'bg-paper hover:bg-muted'}`}>
            <span lang="ja" className="block font-jp-serif text-xl font-black">{m.jp}</span>
            <span className="block text-[0.625rem] tracking-widest uppercase">{m.label}</span>
          </button>
        ))}
      </div>

      <details className="mt-4 border-b border-line pb-3 text-sm">
        <summary className="label min-h-11 cursor-pointer content-center text-soft">What Sensei knows about you</summary>
        <dl className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <div><dt className="inline text-soft">Level: </dt><dd className="inline">{context.level} → {context.target}</dd></div>
          <div><dt className="inline text-soft">Current lesson: </dt><dd className="inline">{context.currentLesson ?? 'none'}</dd></div>
          <div><dt className="inline text-soft">Completed lessons: </dt><dd className="inline">{context.completedLessons.length ? context.completedLessons.slice(0, 4).join('; ') : 'none yet'}</dd></div>
          <div><dt className="inline text-soft">Weak concepts: </dt><dd className="inline" lang="ja">{context.weakConcepts.length ? context.weakConcepts.slice(0, 5).join('、') : 'none recorded'}</dd></div>
        </dl>
      </details>

      {mode === 'challenge' && (
        <section className="mt-6 border-l-4 border-red bg-muted p-5">
          <h2 className="font-display text-2xl tracking-tight">Weak-point drill</h2>
          <p className="mt-2 leading-relaxed text-soft">
            {weakExercises.length ? `${weakExercises.length} exercises drawn from lessons covering the concepts you most recently got wrong. This drill works without AI.` : 'No lesson exercises match your recorded weak concepts yet. Weak points are recorded whenever you answer something wrong.'}
          </p>
          {challengeResult && <p className="mt-2" role="status">Last drill: {challengeResult.correct} of {challengeResult.total} correct.</p>}
          <button type="button" className="btn btn-solid mt-4" disabled={!weakExercises.length} onClick={() => { setChallengeResult(null); setChallenge(weakExercises) }}>Start drill <span aria-hidden>→</span></button>
        </section>
      )}

      {!senseiEndpointConfigured ? (
        <section className="mt-6 border border-ink p-5" aria-labelledby="setup">
          <h2 id="setup" className="font-display text-2xl tracking-tight">Sensei is not connected yet</h2>
          <p className="mt-2 leading-relaxed text-soft">No AI is being called, and nothing on this page is generated. To switch Sensei on:</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
            <li>Create a Supabase project and put <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.</li>
            <li>Set the function secrets <code>AI_PROVIDER</code>, <code>AI_API_KEY</code> and <code>AI_MODEL</code> (server-side only).</li>
            <li>Run <code>supabase functions deploy sensei</code>, then restart the app.</li>
          </ol>
          <p className="mt-3 text-sm text-soft">Full steps are in the README. Until then, the lesson reference below and the weak-point drill (Challenge) work offline.</p>
        </section>
      ) : (
        <section className="mt-6" aria-label="Conversation">
          <div className="min-h-40 space-y-4" aria-live="polite">
            {messages.length === 0 && <p className="text-soft">{active.label} mode. Sensei replies are AI-generated and can be wrong — it is instructed to say when it is unsure.</p>}
            {messages.map((m, i) => (
              <div key={i} className={`fade-up max-w-[92%] whitespace-pre-wrap p-4 leading-relaxed ${m.role === 'user' ? 'ml-auto bg-ink text-paper' : 'border-l-4 border-red bg-muted'}`}>
                <p className="label mb-1 opacity-60">{m.role === 'user' ? 'You' : 'Sensei'}</p>{m.content}
              </div>
            ))}
            {busy && <p className="label animate-pulse text-soft" role="status">Sensei is writing…</p>}
            {error && <p role="alert" className="border-l-4 border-red p-3 text-sm">{error}</p>}
            <div ref={endRef} />
          </div>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void send() }}>
            <label className="sr-only" htmlFor="sensei-input">Message to Sensei</label>
            <textarea id="sensei-input" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send() } }} placeholder={active.placeholder} maxLength={2000} className="min-h-14 flex-1 resize-y border border-ink bg-transparent p-3 outline-none focus:border-red" />
            <button type="submit" className="btn btn-solid" disabled={busy || !draft.trim()}>Send</button>
          </form>
        </section>
      )}

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">Lesson reference — offline search, not AI</h2>
        <label className="sr-only" htmlFor="ref">Search lessons</label>
        <input id="ref" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search grammar or vocabulary, e.g. ほど, deadline, particle" className="mt-3 w-full border-b-2 border-ink bg-transparent py-2 text-lg outline-none focus:border-red" />
        {query.trim() && (hits.length === 0 ? <p className="mt-3 text-soft">Nothing in the published lessons matches “{query}”.</p> : (
          <ul className="mt-2">
            {hits.map((h, i) => (
              <li key={i} className="border-b border-line py-3">
                <p><span lang="ja" className="font-jp text-lg font-bold">{h.title}</span> <span className="label ml-2 text-soft">{h.kind}</span></p>
                <p className="text-soft">{h.body}</p>
                <Link to={`/app/lesson/${h.lessonSlug}`} className="label text-red">From: {h.lessonTitle} →</Link>
              </li>
            ))}
          </ul>
        ))}
      </section>
    </div>
  )
}
