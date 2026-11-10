import type { Attempt, Session, Skill } from '@/modules/learner/types'

/** Every number on the dashboard is derived here, from recorded activity only. */

export const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (d: Date, n: number) => {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export const sessionSeconds = (s: Session) => Math.max(0, (Date.parse(s.endedAt) - Date.parse(s.startedAt)) / 1000)

/** Consecutive study days ending today — or yesterday, so a streak is not "lost" before today's session. */
export function streak(sessions: Session[], now: Date): number {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.startedAt))))
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1)
  let count = 0
  while (days.has(dayKey(cursor))) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

export interface DayActivity {
  key: string
  weekday: string
  seconds: number
  isToday: boolean
}
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function lastSevenDays(sessions: Session[], now: Date): DayActivity[] {
  const byDay = new Map<string, number>()
  for (const s of sessions) {
    const k = dayKey(new Date(s.startedAt))
    byDay.set(k, (byDay.get(k) ?? 0) + sessionSeconds(s))
  }
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6)
    const key = dayKey(d)
    return { key, weekday: WEEKDAYS[d.getDay()]!, seconds: byDay.get(key) ?? 0, isToday: i === 6 }
  })
}

export const secondsOn = (sessions: Session[], day: Date) =>
  sessions.filter((s) => dayKey(new Date(s.startedAt)) === dayKey(day)).reduce((n, s) => n + sessionSeconds(s), 0)

export interface SkillAccuracy {
  skill: Skill
  correct: number
  total: number
}
export function skillAccuracy(attempts: Attempt[]): SkillAccuracy[] {
  const map = new Map<Skill, SkillAccuracy>()
  for (const a of attempts) {
    const row = map.get(a.skill) ?? { skill: a.skill, correct: 0, total: 0 }
    row.total++
    if (a.isCorrect) row.correct++
    map.set(a.skill, row)
  }
  return [...map.values()]
}

export interface ConceptRecord {
  conceptKey: string
  label: string
  skill: Skill
  correct: number
  incorrect: number
  lastAttemptAt: string
  lastCorrect: boolean
}
export function conceptRecords(attempts: Attempt[]): ConceptRecord[] {
  const map = new Map<string, ConceptRecord>()
  for (const a of [...attempts].sort((x, y) => x.attemptedAt.localeCompare(y.attemptedAt))) {
    const row =
      map.get(a.conceptKey) ??
      ({ conceptKey: a.conceptKey, label: a.conceptLabel, skill: a.skill, correct: 0, incorrect: 0, lastAttemptAt: a.attemptedAt, lastCorrect: a.isCorrect } satisfies ConceptRecord)
    if (a.isCorrect) row.correct++
    else row.incorrect++
    row.lastAttemptAt = a.attemptedAt
    row.lastCorrect = a.isCorrect
    map.set(a.conceptKey, row)
  }
  return [...map.values()]
}

/** Weak = the most recent attempt was wrong, or the concept is missed at least as often as it is answered. */
export const weakConcepts = (attempts: Attempt[]) =>
  conceptRecords(attempts)
    .filter((c) => !c.lastCorrect || c.incorrect >= c.correct)
    .sort((a, b) => b.lastAttemptAt.localeCompare(a.lastAttemptAt))

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 min'
  if (seconds < 60) return '<1 min'
  const mins = Math.round(seconds / 60)
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`
}
