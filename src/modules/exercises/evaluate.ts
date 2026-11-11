import type { Exercise } from './types'

/** Small deterministic hash so shuffles are stable per exercise (no reshuffle on re-render). */
export function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

export function shuffled<T>(items: T[], seed: string): T[] {
  const out = [...items]
  let s = hash(seed) || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Shuffle that never returns the original order (when one exists), so "order" items are never pre-solved. */
export function scrambled<T>(items: T[], seed: string): T[] {
  for (let n = 0; n < 8; n++) {
    const out = shuffled(items, `${seed}:${n}`)
    if (out.some((x, i) => x !== items[i])) return out
  }
  return [...items].reverse()
}

export const normalise = (text: string) =>
  text.normalize('NFKC').toLowerCase().replace(/[\s。．.、,！!？?]/g, '')

export type Response = { kind: 'mcq'; text: string | null } | { kind: 'order'; tokens: string[] } | { kind: 'type'; text: string }

export function isCorrect(exercise: Exercise, response: Response): boolean {
  if (exercise.kind === 'mcq') return response.kind === 'mcq' && response.text === exercise.options[0]!.text
  if (exercise.kind === 'order') return response.kind === 'order' && response.tokens.join('\u0001') === exercise.tokens.join('\u0001')
  return response.kind === 'type' && exercise.accept.some((a) => normalise(a) === normalise(response.text))
}

export const responseText = (response: Response): string | null =>
  response.kind === 'order' ? response.tokens.join(' ') : response.text
