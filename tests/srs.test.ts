import { describe, expect, it } from 'vitest'
import { cardsFromLesson, DEFAULT_SRS, dueCards, isMastered, newCard, schedule } from '@/modules/revision/srs'
import { LESSONS, lessonBySlug, nextLesson } from '@/content/lessons'
import { CURRICULUM } from '@/modules/curriculum/structure'
import { isCorrect, scrambled } from '@/modules/exercises/evaluate'

const now = new Date('2026-11-11T09:00:00Z')
const days = (a: string) => (Date.parse(a) - now.getTime()) / 86_400_000

describe('spaced repetition', () => {
  const fresh = newCard('vocabulary', 'vocab:x', 'x', 'y', now)
  it('new cards are due immediately', () => expect(dueCards([fresh], now)).toHaveLength(1))
  it('schedules first reviews by rating', () => {
    expect(days(schedule(fresh, 'again', now).dueAt)).toBeCloseTo(10 / 1440)
    expect(days(schedule(fresh, 'hard', now).dueAt)).toBeCloseTo(0.25)
    expect(days(schedule(fresh, 'good', now).dueAt)).toBeCloseTo(1)
    expect(days(schedule(fresh, 'easy', now).dueAt)).toBeCloseTo(4)
  })
  it('grows intervals with successful recall and orders hard < good < easy', () => {
    const once = schedule(fresh, 'good', now)
    const [h, g, e] = (['hard', 'good', 'easy'] as const).map((r) => schedule(once, r, now).intervalDays)
    expect(h!).toBeLessThan(g!)
    expect(g!).toBeLessThan(e!)
    expect(g).toBeCloseTo(2.5)
  })
  it('a lapse resets repetitions, counts the lapse and lowers ease (never below the floor)', () => {
    let card = schedule(schedule(fresh, 'good', now), 'good', now)
    card = schedule(card, 'again', now)
    expect(card).toMatchObject({ repetitions: 0, lapses: 1 })
    expect(card.ease).toBeCloseTo(2.3)
    for (let i = 0; i < 20; i++) card = schedule(card, 'again', now)
    expect(card.ease).toBe(DEFAULT_SRS.minimumEase)
  })
  it('mastery needs repeated recall AND a long interval — not one good answer', () => {
    let card = schedule(fresh, 'easy', now)
    expect(isMastered(card)).toBe(false)
    let n = 1
    while (!isMastered(card) && n < 20) { card = schedule(card, 'good', now); n++ }
    expect(n).toBeGreaterThanOrEqual(DEFAULT_SRS.masteryRepetitions)
    expect(card.intervalDays).toBeGreaterThanOrEqual(DEFAULT_SRS.masteryIntervalDays)
    expect(isMastered(schedule(card, 'again', now))).toBe(false)
  })
  it('lesson cards are created once', () => {
    const lesson = lessonBySlug('n5-desu')!
    const first = cardsFromLesson(lesson, [], now)
    expect(first.length).toBe(lesson.vocab.length + lesson.grammar.length)
    expect(cardsFromLesson(lesson, first, now)).toHaveLength(0)
  })
})

describe('lesson content integrity', () => {
  it('every lesson belongs to a real module and has unique slugs and exercise keys', () => {
    const modules = new Set(CURRICULUM.flatMap((l) => l.modules.map((m) => `${l.level}/${m.slug}`)))
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(LESSONS.length)
    const keys = LESSONS.flatMap((l) => [...l.practice, ...l.assessment].map((e) => e.key))
    expect(new Set(keys).size).toBe(keys.length)
    for (const l of LESSONS) {
      expect(modules.has(`${l.level}/${l.module}`), l.slug).toBe(true)
      expect(l.practice.length, l.slug).toBeGreaterThanOrEqual(3)
      expect(l.assessment.length, l.slug).toBeGreaterThanOrEqual(3)
    }
  })
  it('every exercise is answerable and unambiguous', () => {
    for (const l of LESSONS)
      for (const e of [...l.practice, ...l.assessment]) {
        if (e.kind === 'mcq') {
          expect(new Set(e.options.map((o) => o.text)).size, e.key).toBe(e.options.length)
          expect(e.options.length, e.key).toBe(4)
          expect(isCorrect(e, { kind: 'mcq', text: e.options[0]!.text })).toBe(true)
          expect(isCorrect(e, { kind: 'mcq', text: null })).toBe(false)
        } else if (e.kind === 'order') {
          expect(isCorrect(e, { kind: 'order', tokens: e.tokens })).toBe(true)
          expect(scrambled(e.tokens, e.key), e.key).not.toEqual(e.tokens)
          expect(new Set(e.tokens).size, `${e.key}: duplicate tokens make the order ambiguous`).toBe(e.tokens.length)
        } else {
          expect(isCorrect(e, { kind: 'type', text: ` ${e.accept[0]!.toUpperCase()}。 ` })).toBe(true)
          expect(isCorrect(e, { kind: 'type', text: 'zzz' })).toBe(false)
        }
      }
  })
  it('recommends lessons in curriculum order from the learner level', () => {
    expect(nextLesson('foundation', [])?.slug).toBe('hiragana-1')
    expect(nextLesson('n4', [])?.level).toBe('n4')
    const all = LESSONS.map((l) => ({ slug: l.slug, completedAt: '', correct: 1, total: 1 }))
    expect(nextLesson('n5', all)).toBeNull()
    expect(nextLesson('n1', [])?.slug).toBe('hiragana-1')
  })
})
