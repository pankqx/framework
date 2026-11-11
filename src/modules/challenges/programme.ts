import { LESSONS } from '@/content/lessons'
import { KANJI } from '@/content/kanji'
import { shuffled } from '@/modules/exercises/evaluate'
import type { Exercise } from '@/modules/exercises/types'
import type { Lesson } from '@/modules/lessons/types'
import type { Level } from '@/modules/learner/types'

export type ChallengeDays = 30 | 60 | 90
export const CHALLENGES: Record<ChallengeDays, { title: string; focus: string; levels: Level[] }> = {
  30: { title: 'Foundation and writing systems', focus: 'Hiragana, katakana, sound and rhythm.', levels: ['foundation'] },
  60: { title: 'Beginner development', focus: 'The writing systems, then the foundations of N5.', levels: ['foundation', 'n5'] },
  90: { title: 'Consolidation and progression', focus: 'N5 consolidated, N4 begun, and a first look at intermediate study.', levels: ['foundation', 'n5', 'n4', 'n3'] },
}

export interface ChallengeDay {
  day: number
  kind: 'study' | 'weekly-assessment' | 'final-evaluation'
  lessons: Lesson[]
  kanji: string[]
  revisionMinutes: number
}
export interface Programme {
  days: ChallengeDay[]
  totals: { lessons: number; vocabulary: number; grammar: number; kanji: number }
  /** Lessons in scope that do not fit in the period at this daily study time. */
  unscheduled: number
  /** Study days with no new lesson, because published lessons ran out. */
  openDays: number
}

/**
 * Builds the day-by-day programme from the lessons that actually exist.
 * Workload adapts to time: about 60% of each day is new material, the rest revision.
 */
export function buildProgramme(length: ChallengeDays, dailyMinutes: number): Programme {
  const scope = LESSONS.filter((l) => CHALLENGES[length].levels.includes(l.level)).filter((l) => length !== 90 || l.level !== 'n3' || l.slug === 'n3-you-koto')
  const budget = Math.max(8, Math.round(dailyMinutes * 0.6))
  const studyDays = Array.from({ length }, (_, i) => i + 1).filter((d) => d % 7 !== 0 && d !== length)
  // Spread lessons across the whole period rather than front-loading them.
  const perDay = Math.max(1, Math.ceil(scope.length / studyDays.length))
  const queue = [...scope]
  const kanjiQueue = length === 30 ? [] : KANJI.map((k) => k.char)
  const kanjiEvery = Math.max(1, Math.floor(studyDays.length / Math.max(1, kanjiQueue.length)))
  const kanjiPerDay = Math.ceil(kanjiQueue.length / studyDays.length)

  let studyIndex = 0
  const days: ChallengeDay[] = Array.from({ length }, (_, i) => {
    const day = i + 1
    if (day === length) return { day, kind: 'final-evaluation', lessons: [], kanji: [], revisionMinutes: dailyMinutes }
    if (day % 7 === 0) return { day, kind: 'weekly-assessment', lessons: [], kanji: [], revisionMinutes: Math.round(dailyMinutes * 0.5) }
    const lessons: Lesson[] = []
    let used = 0
    while (queue.length && lessons.length < perDay && (lessons.length === 0 || used + queue[0]!.minutes <= budget)) {
      used += queue[0]!.minutes
      lessons.push(queue.shift()!)
    }
    const kanji = length !== 30 && studyIndex % kanjiEvery === 0 ? kanjiQueue.splice(0, kanjiPerDay) : []
    studyIndex++
    return { day, kind: 'study', lessons, kanji, revisionMinutes: Math.max(0, dailyMinutes - used) }
  })

  const scheduled = days.flatMap((d) => d.lessons)
  return {
    days,
    totals: {
      lessons: scheduled.length,
      vocabulary: scheduled.reduce((n, l) => n + l.vocab.length, 0),
      grammar: scheduled.reduce((n, l) => n + l.grammar.length, 0),
      kanji: days.reduce((n, d) => n + d.kanji.length, 0),
    },
    unscheduled: queue.length,
    openDays: days.filter((d) => d.kind === 'study' && d.lessons.length === 0).length,
  }
}

/** Questions for an assessment day: drawn from the lessons scheduled since the previous assessment (or all, for the final). */
export function assessmentFor(programme: Programme, day: number): Exercise[] {
  const target = programme.days[day - 1]
  if (!target || target.kind === 'study') return []
  const from = target.kind === 'final-evaluation' ? 1 : day - 6
  const lessons = programme.days.filter((d) => d.day >= from && d.day < day).flatMap((d) => d.lessons)
  const pool = lessons.flatMap((l) => l.assessment)
  return shuffled(pool, `challenge-${day}`).slice(0, target.kind === 'final-evaluation' ? 15 : 10)
}

export const currentDay = (startedAt: string, now: Date, length: number) =>
  Math.min(length, Math.max(1, Math.floor((new Date(now.toDateString()).getTime() - new Date(new Date(startedAt).toDateString()).getTime()) / 86_400_000) + 1))
