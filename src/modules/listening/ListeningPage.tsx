import { useEffect, useState } from 'react'
import { AudioButton, useTts } from '@/components/AudioButton'
import { LISTENING, SPEAKING_PHRASES } from '@/content/studio'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { normalise } from '@/modules/exercises/evaluate'
import { listenOnce, microphonePermission, recognitionConstructor, type ListenResult, type MicPermission } from '@/lib/speech'
import { newId } from '@/lib/id'
import { useUpdateLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL, type Level } from '@/modules/learner/types'

const PERMISSION_COPY: Record<MicPermission, string> = {
  granted: 'Microphone: allowed.',
  denied: 'Microphone: blocked. Allow it for this site in your browser settings to practise speaking.',
  prompt: 'Microphone: your browser will ask for permission when you press Speak.',
  unknown: 'Microphone: this browser does not report permission status; it may ask when you press Speak.',
}

export default function ListeningPage() {
  const [tab, setTab] = useState<'listen' | 'speak'>('listen')
  const [level, setLevel] = useState<Level>('n5')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunSummary | null>(null)
  const tts = useTts()
  const set = LISTENING.filter((e) => e.level === level)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">聴く・話す</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Speaking & Listening Studio</h1>
      <div role="tablist" className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
        {(['listen', 'speak'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => { setTab(t); setRunning(false) }} className={`label min-h-12 ${tab === t ? 'bg-ink text-paper' : 'bg-paper'}`}>{t === 'listen' ? 'Listening' : 'Speaking'}</button>
        ))}
      </div>

      {tab === 'listen' && (running ? (
        <div className="mt-8"><ExerciseRunner exercises={set} sessionKind="listening" onFinish={(s) => { setResult(s); setRunning(false) }} /></div>
      ) : (
        <section className="mt-8">
          <p className="border-l-2 border-blue pl-3 text-sm leading-relaxed text-soft">
            Audio is produced by your device’s Japanese speech synthesis — it is not a native-speaker recording, and its naturalness depends on your device.
            {tts === 'ready' ? ' A Japanese voice is available on this device.' : tts === 'no-japanese-voice' ? ' No Japanese voice is installed on this device, so audio cannot play here; you can still reveal transcripts.' : ' This browser has no speech synthesis; you can still reveal transcripts.'}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-px border border-line bg-line">
            {(['n5', 'n4', 'n3'] as const).map((l) => (
              <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`min-h-14 ${level === l ? 'bg-red text-[#f4f0e7]' : 'bg-paper'}`}>
                <span className="block font-display text-xl">{LEVEL_LABEL[l].replace('JLPT ', '')}</span><span className="label">{LISTENING.filter((e) => e.level === l).length} items</span>
              </button>
            ))}
          </div>
          {result && <p className="mt-6 border-l-4 border-red bg-muted p-4" role="status">Listening: {result.correct} of {result.total} correct.</p>}
          <button type="button" className="btn btn-solid mt-6" onClick={() => { setResult(null); setRunning(true) }}>Start listening practice <span aria-hidden>→</span></button>
        </section>
      ))}

      {tab === 'speak' && <Speaking />}
    </div>
  )
}

function Speaking() {
  const update = useUpdateLearner()
  const supported = recognitionConstructor() !== null
  const [permission, setPermission] = useState<MicPermission>('unknown')
  const [index, setIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const [outcome, setOutcome] = useState<ListenResult | null>(null)
  const phrase = SPEAKING_PHRASES[index]!
  useEffect(() => { void microphonePermission().then(setPermission) }, [outcome])

  const matched = outcome?.ok ? [phrase.jp, phrase.kana].some((t) => normalise(t) === normalise(outcome.transcript)) : false

  const speakNow = async () => {
    setListening(true); setOutcome(null)
    const started = new Date()
    const r = await listenOnce()
    setListening(false); setOutcome(r)
    if (r.ok) {
      const ok = [phrase.jp, phrase.kana].some((t) => normalise(t) === normalise(r.transcript))
      update.mutate((state) => {
        state.attempts.push({ id: newId(), exerciseKey: `speak:${phrase.kana}`, conceptKey: `speaking.phrase.${phrase.kana}`, conceptLabel: `Speaking: ${phrase.jp}`, skill: 'speaking', level: phrase.level, response: r.transcript, isCorrect: ok, attemptedAt: new Date().toISOString() })
        state.sessions.push({ id: newId(), kind: 'speaking', startedAt: started.toISOString(), endedAt: new Date().toISOString() })
      })
    }
  }

  return (
    <section className="mt-8">
      <p className={`border-l-2 pl-3 text-sm leading-relaxed ${permission === 'denied' || !supported ? 'border-red' : 'border-blue'} text-soft`} role="status">
        {supported ? PERMISSION_COPY[permission] : 'Speech recognition is not supported in this browser (it currently works in Chrome, Edge and Safari). You can still listen and repeat aloud, but KOTOBA cannot check what you say here.'}
      </p>

      <div className="mt-6 border-t border-ink pt-4">
        <p className="label text-soft">{LEVEL_LABEL[phrase.level]} · phrase {index + 1} / {SPEAKING_PHRASES.length}</p>
        <p lang="ja" className="mt-4 font-jp-serif text-4xl leading-snug font-black">{phrase.jp}</p>
        <p lang="ja" className="mt-1 font-jp text-soft">{phrase.kana}</p>
        <p className="mt-1 text-soft">{phrase.en}</p>
        <div className="mt-5"><AudioButton text={phrase.jp} label="Listen" /></div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-solid" disabled={!supported || listening || permission === 'denied'} onClick={speakNow}>{listening ? '● Listening…' : '● Speak'}</button>
          <button type="button" className="btn" onClick={() => { setIndex((index + 1) % SPEAKING_PHRASES.length); setOutcome(null) }}>Next phrase</button>
        </div>

        {outcome && (
          <div className="fade-up mt-6 border-l-4 border-red bg-muted p-5" aria-live="polite">
            {outcome.ok ? (
              <>
                <p className="label">{matched ? 'Recognised as the target phrase' : 'Recognised as something different'}</p>
                <p className="mt-2">Heard: <span lang="ja" className="font-jp text-xl font-bold">{outcome.transcript}</span></p>
                {!matched && <p className="mt-1">Target: <span lang="ja" className="font-jp text-xl">{phrase.jp}</span></p>}
                <p className="mt-3 text-sm leading-relaxed text-soft">This compares what your browser’s speech recogniser heard with the target text. It shows whether you were understood — it is not a pronunciation or pitch-accent score, and recognisers make mistakes in both directions.</p>
              </>
            ) : (
              <p>{outcome.reason === 'denied' ? 'Microphone access was refused. Allow the microphone for this site and try again.' : outcome.reason === 'no-speech' ? 'No speech was detected. Try again, a little closer to the microphone.' : outcome.reason === 'unsupported' ? 'Speech recognition is not available in this browser.' : `Speech recognition failed (${outcome.detail ?? 'unknown error'}). Nothing was recorded.`}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
