import { useEffect, useState } from 'react'
import { onVoicesChanged, speak, ttsSupport, type TtsSupport } from '@/lib/speech'

export function useTts(): TtsSupport {
  const [support, setSupport] = useState<TtsSupport>(() => ttsSupport())
  useEffect(() => onVoicesChanged(() => setSupport(ttsSupport())), [])
  return support
}

/** Plays Japanese with the device's own voice. Says so plainly when the device has none. */
export function AudioButton({ text, label = 'Play' }: { text: string; label?: string }) {
  const support = useTts()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  if (support !== 'ready') {
    return (
      <p className="border-l-2 border-blue pl-3 text-sm leading-relaxed text-soft">
        {support === 'unsupported' ? 'This browser has no speech synthesis, so audio cannot be played here.' : 'No Japanese voice is installed on this device, so audio cannot be played here. Add a Japanese voice in your system settings, or reveal the transcript instead.'}
      </p>
    )
  }
  const play = async (rate: number) => {
    setBusy(true)
    setFailed(!(await speak(text, rate)))
    setBusy(false)
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn" disabled={busy} onClick={() => play(1)}>▶ {label}</button>
      <button type="button" className="btn" disabled={busy} onClick={() => play(0.7)}>▶ Slow</button>
      <span className="text-xs text-soft">{failed ? 'Playback failed on this device.' : 'Device voice (synthesised, not a native recording)'}</span>
    </div>
  )
}
