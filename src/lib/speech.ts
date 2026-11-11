/** Honest wrappers around browser speech features: every function reports real capability. */

export function japaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('ja')) ?? null
}

export type TtsSupport = 'ready' | 'no-japanese-voice' | 'unsupported'

export function ttsSupport(): TtsSupport {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 'unsupported'
  return japaneseVoice() ? 'ready' : 'no-japanese-voice'
}

/** Speaks Japanese text. Resolves false if the device cannot actually do it. */
export function speak(text: string, rate = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const voice = japaneseVoice()
    if (!voice) return resolve(false)
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = rate
    u.onend = () => resolve(true)
    u.onerror = () => resolve(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  })
}

export function onVoicesChanged(cb: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {}
  window.speechSynthesis.addEventListener('voiceschanged', cb)
  return () => window.speechSynthesis.removeEventListener('voiceschanged', cb)
}

interface RecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

export function recognitionConstructor(): (new () => RecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type ListenResult = { ok: true; transcript: string } | { ok: false; reason: 'unsupported' | 'denied' | 'no-speech' | 'error'; detail?: string }

/** One utterance of Japanese speech recognition. Never fabricates a transcript. */
export function listenOnce(): Promise<ListenResult> {
  return new Promise((resolve) => {
    const Ctor = recognitionConstructor()
    if (!Ctor) return resolve({ ok: false, reason: 'unsupported' })
    const rec = new Ctor()
    let settled = false
    const done = (r: ListenResult) => {
      if (!settled) {
        settled = true
        resolve(r)
      }
    }
    rec.lang = 'ja-JP'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => done({ ok: true, transcript: e.results[0][0].transcript })
    rec.onerror = (e) =>
      done({ ok: false, reason: e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : e.error === 'no-speech' ? 'no-speech' : 'error', detail: e.error })
    rec.onend = () => done({ ok: false, reason: 'no-speech' })
    try {
      rec.start()
    } catch (err) {
      done({ ok: false, reason: 'error', detail: String(err) })
    }
  })
}

export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unknown'
export async function microphonePermission(): Promise<MicPermission> {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return status.state
  } catch {
    return 'unknown'
  }
}
