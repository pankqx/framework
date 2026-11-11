import type { ChatTurn, SenseiContext, SenseiMode } from '../../../supabase/functions/_shared/prompt'
import { weakConcepts } from '@/modules/analytics/stats'
import { LESSONS, lessonBySlug, nextLesson } from '@/content/lessons'
import { LEVEL_LABEL, type LearnerState } from '@/modules/learner/types'
import { plain } from '@/components/JP'

const URL_ = import.meta.env?.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when the app has somewhere to send Sensei requests. It says nothing about whether the function is deployed. */
export const senseiEndpointConfigured = Boolean(URL_ && KEY)

/** What Sensei is told about the learner — built only from recorded data. */
export function buildContext(state: LearnerState): SenseiContext {
  const done = [...state.lessonCompletions].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const doneLessons = done.map((c) => lessonBySlug(c.slug)).filter((l) => l !== undefined)
  const level = state.profile?.currentLevel ?? 'foundation'
  return {
    level: LEVEL_LABEL[level],
    target: state.goals ? LEVEL_LABEL[state.goals.jlptTarget] : 'not set',
    goal: state.goals?.primaryGoal ?? 'not set',
    explanationLanguage: state.goals?.explanationLanguage ?? 'en',
    currentLesson: nextLesson(level, state.lessonCompletions)?.title ?? null,
    completedLessons: doneLessons.slice(0, 10).map((l) => l.title),
    weakConcepts: weakConcepts(state.attempts).slice(0, 10).map((c) => c.label),
    knownMaterial: doneLessons.slice(0, 8).flatMap((l) => [...l.grammar.map((g) => `${g.pattern} (${g.meaning})`), ...l.vocab.slice(0, 6).map((v) => `${plain(v.term)} (${v.meaning})`)]).slice(0, 60),
  }
}

export type SenseiReply = { ok: true; text: string } | { ok: false; reason: 'not-configured' | 'function-not-configured' | 'network' | 'provider' | 'invalid'; detail?: string }

export async function askSensei(mode: SenseiMode, context: SenseiContext, messages: ChatTurn[]): Promise<SenseiReply> {
  if (!URL_ || !KEY) return { ok: false, reason: 'not-configured' }
  let res: Response
  try {
    res = await fetch(`${URL_.replace(/\/$/, '')}/functions/v1/sensei`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: KEY, authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ mode, context, messages }),
    })
  } catch (err) {
    return { ok: false, reason: 'network', detail: String(err) }
  }
  const data = (await res.json().catch(() => null)) as { text?: string; error?: string; detail?: string } | null
  if (res.ok && data?.text) return { ok: true, text: data.text }
  if (res.status === 503 || res.status === 404) return { ok: false, reason: 'function-not-configured', detail: data?.detail }
  if (res.status === 400) return { ok: false, reason: 'invalid', detail: data?.detail }
  return { ok: false, reason: 'provider', detail: data?.error ?? `HTTP ${res.status}` }
}

export interface ReferenceHit { kind: 'grammar' | 'vocabulary'; title: string; body: string; lessonSlug: string; lessonTitle: string }

/** Offline fallback: search the published lessons. Clearly not AI — it only finds what the lessons already say. */
export function searchReference(query: string): ReferenceHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []
  const hits: ReferenceHit[] = []
  for (const l of LESSONS) {
    for (const g of l.grammar)
      if (`${g.pattern} ${g.meaning} ${g.note}`.toLowerCase().includes(q)) hits.push({ kind: 'grammar', title: g.pattern, body: `${g.meaning} — ${g.note}`, lessonSlug: l.slug, lessonTitle: l.title })
    for (const v of l.vocab)
      if (`${plain(v.term)} ${v.reading} ${v.meaning}`.toLowerCase().includes(q)) hits.push({ kind: 'vocabulary', title: `${plain(v.term)}（${v.reading}）`, body: v.meaning, lessonSlug: l.slug, lessonTitle: l.title })
  }
  return hits.slice(0, 12)
}

/** Challenge mode without AI: real exercises from lessons, chosen by the learner's recorded weak concepts. */
export function challengeFromWeaknesses(state: LearnerState, limit = 6) {
  const weak = new Set(weakConcepts(state.attempts).map((c) => c.conceptKey))
  const pool = LESSONS.flatMap((l) => [...l.practice, ...l.assessment])
  const seen = new Set<string>()
  return pool.filter((e) => weak.has(e.conceptKey) && !seen.has(e.key) && seen.add(e.key)).slice(0, limit)
}
