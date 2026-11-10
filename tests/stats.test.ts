import { describe, expect, it } from 'vitest'
import { lastSevenDays, secondsOn, skillAccuracy, streak, weakConcepts } from '@/modules/analytics/stats'
import type { Attempt, Session } from '@/modules/learner/types'

const now = new Date(2026, 10, 10, 21, 0)
const session = (daysAgo: number, minutes = 10): Session => {
  const start = new Date(2026, 10, 10 - daysAgo, 9, 0)
  return { id: `s${daysAgo}-${minutes}`, kind: 'lesson', startedAt: start.toISOString(), endedAt: new Date(start.getTime() + minutes * 60000).toISOString() }
}
const attempt = (conceptKey: string, isCorrect: boolean, minute: number, skill: Attempt['skill'] = 'grammar'): Attempt => ({
  id: `${conceptKey}-${minute}`, exerciseKey: 'x', conceptKey, conceptLabel: conceptKey, skill, level: 'n5', response: null, isCorrect,
  attemptedAt: new Date(2026, 10, 10, 9, minute).toISOString(),
})

describe('streak', () => {
  it('is zero with no activity', () => expect(streak([], now)).toBe(0))
  it('counts consecutive days ending today', () => expect(streak([session(0), session(1), session(2), session(4)], now)).toBe(3))
  it('survives until the end of the next day', () => expect(streak([session(1), session(2)], now)).toBe(2))
  it('breaks after a missed day', () => expect(streak([session(2), session(3)], now)).toBe(0))
  it('counts a day once however many sessions it has', () => expect(streak([session(0, 5), session(0, 7)], now)).toBe(1))
})

describe('study time', () => {
  it('sums real session durations per day', () => {
    const sessions = [session(0, 10), session(0, 5), session(3, 20), session(9, 60)]
    expect(secondsOn(sessions, now)).toBe(900)
    const week = lastSevenDays(sessions, now)
    expect(week).toHaveLength(7)
    expect(week[6]).toMatchObject({ seconds: 900, isToday: true })
    expect(week[3]?.seconds).toBe(1200)
    expect(week.reduce((n, d) => n + d.seconds, 0)).toBe(2100)
  })
})

describe('accuracy and weaknesses', () => {
  const attempts = [attempt('a', false, 1), attempt('a', true, 2), attempt('a', true, 3), attempt('b', true, 1), attempt('b', false, 4), attempt('c', true, 5, 'kana')]
  it('computes per-skill accuracy', () => {
    expect(skillAccuracy(attempts)).toEqual(expect.arrayContaining([{ skill: 'grammar', correct: 3, total: 5 }, { skill: 'kana', correct: 1, total: 1 }]))
  })
  it('flags concepts last answered wrong, and clears ones since recovered', () => {
    expect(weakConcepts(attempts).map((c) => c.conceptKey)).toEqual(['b'])
  })
})
