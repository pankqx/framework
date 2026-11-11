import { describe, expect, it } from 'vitest'
import { examQuestions, OFFICIAL_MINUTES } from '@/content/jlpt'
import { LISTENING, PASSAGES, TYPING_DRILLS } from '@/content/studio'
import { TECH_EXERCISES } from '@/content/techlab'
import { KANJI, SIMILAR } from '@/content/kanji'
import { LESSONS } from '@/content/lessons'
import { kanjiQuiz } from '@/modules/kanji/KanjiPage'
import { isCorrect } from '@/modules/exercises/evaluate'
import type { Exercise } from '@/modules/exercises/types'
import { assessmentFor, buildProgramme, currentDay } from '@/modules/challenges/programme'
import { buildSystemPrompt, validateRequest, SENSEI_MODES, type SenseiContext } from '../supabase/functions/_shared/prompt'
import { searchReference, challengeFromWeaknesses, buildContext } from '@/modules/sensei/client'
import { emptyLearnerState } from '@/modules/learner/types'

const wellFormed = (e: Exercise) => {
  if (e.kind === 'mcq') {
    expect(e.options.length, e.key).toBe(4)
    expect(new Set(e.options.map((o) => o.text)).size, e.key).toBe(4)
  } else if (e.kind === 'order') {
    expect(new Set(e.tokens).size, e.key).toBe(e.tokens.length)
    expect(isCorrect(e, { kind: 'order', tokens: e.tokens })).toBe(true)
  } else expect(e.accept.length, e.key).toBeGreaterThan(0)
}

describe('practice content', () => {
  const sets = (['n5', 'n4', 'n3'] as const).flatMap((l) => (['vocabulary', 'grammar-reading', 'listening'] as const).map((s) => [l, s, examQuestions(l, s)] as const))
  it('every JLPT level/section has questions, all well formed, with globally unique keys', () => {
    for (const [l, s, qs] of sets) {
      expect(qs.length, `${l}/${s}`).toBeGreaterThanOrEqual(2)
      qs.forEach(wellFormed)
      expect(qs.every((q) => q.level === l)).toBe(true)
    }
    const all = [...sets.flatMap(([, , q]) => q), ...TYPING_DRILLS, ...TECH_EXERCISES, ...LESSONS.flatMap((l) => [...l.practice, ...l.assessment])]
    expect(new Set(all.map((e) => e.key)).size).toBe(all.length)
  })
  it('uses the official section times', () => {
    expect(OFFICIAL_MINUTES.n3).toEqual({ vocabulary: 30, 'grammar-reading': 70, listening: 40 })
  })
  it('studio and tech content is well formed', () => {
    ;[...LISTENING, ...TYPING_DRILLS, ...TECH_EXERCISES, ...PASSAGES.flatMap((p) => p.questions)].forEach(wellFormed)
    expect(LISTENING.every((e) => e.audio)).toBe(true)
    for (const p of PASSAGES) expect(p.questions.every((q) => q.passage)).toBe(true)
  })
  it('kanji data is consistent and the generated quiz is unambiguous', () => {
    expect(new Set(KANJI.map((k) => k.char)).size).toBe(KANJI.length)
    for (const k of KANJI) {
      expect([...k.char]).toHaveLength(1)
      expect(k.compounds.length).toBeGreaterThan(0)
      expect(k.compounds.every(([w]) => w.includes(k.char)), k.char).toBe(true)
      expect(k.example[0].includes(k.char), k.char).toBe(true)
    }
    for (const g of SIMILAR) expect(g.chars.length).toBeGreaterThanOrEqual(2)
    const quiz = kanjiQuiz(KANJI, 'seed')
    expect(quiz).toHaveLength(KANJI.length)
    quiz.forEach(wellFormed)
  })
})

describe('challenge programmes', () => {
  it('fills exactly the requested number of days with weekly assessments and a final evaluation', () => {
    for (const len of [30, 60, 90] as const)
      for (const minutes of [15, 30, 60, 120]) {
        const p = buildProgramme(len, minutes)
        expect(p.days).toHaveLength(len)
        expect(p.days.at(-1)!.kind).toBe('final-evaluation')
        expect(p.days.filter((d) => d.kind === 'weekly-assessment')).toHaveLength(Math.floor((len - 1) / 7))
        const slugs = p.days.flatMap((d) => d.lessons.map((l) => l.slug))
        expect(new Set(slugs).size).toBe(slugs.length)
        expect(p.totals.lessons + p.unscheduled).toBeGreaterThan(0)
        expect(assessmentFor(p, len).length).toBeGreaterThan(0)
        expect(assessmentFor(p, 7).length).toBeGreaterThan(0)
        expect(assessmentFor(p, 1)).toEqual([])
      }
  })
  it('schedules lessons in curriculum order and never invents lessons', () => {
    const p = buildProgramme(60, 30)
    const scheduled = p.days.flatMap((d) => d.lessons)
    const inOrder = LESSONS.filter((l) => scheduled.includes(l))
    expect(scheduled).toEqual(inOrder)
    expect(buildProgramme(30, 30).totals.kanji).toBe(0)
    expect(buildProgramme(90, 30).totals.kanji).toBe(KANJI.length)
  })
  it('tracks the current day by calendar date', () => {
    const start = new Date(2026, 10, 1, 23, 0).toISOString()
    expect(currentDay(start, new Date(2026, 10, 1, 23, 30), 30)).toBe(1)
    expect(currentDay(start, new Date(2026, 10, 2, 0, 5), 30)).toBe(2)
    expect(currentDay(start, new Date(2027, 0, 1), 30)).toBe(30)
  })
})

describe('AI Sensei', () => {
  const ctx: SenseiContext = { level: 'JLPT N4', target: 'JLPT N3', goal: 'jlpt', explanationLanguage: 'en', currentLesson: 'The て-form', completedLessons: ['A は B です'], weakConcepts: ['Conditional ～と'], knownMaterial: ['A は B です (A is B)'] }
  it('grounds every mode in the learner context and the honesty rules', () => {
    for (const mode of SENSEI_MODES) {
      const prompt = buildSystemPrompt(mode, ctx)
      for (const needle of ['JLPT N4', 'JLPT N3', 'The て-form', 'Conditional ～と', 'A は B です', 'Never present uncertain information as fact']) expect(prompt).toContain(needle)
    }
    expect(buildSystemPrompt('correction', ctx)).toContain('Natural native-style alternative')
  })
  it('validates requests', () => {
    const ok = { mode: 'ask', context: ctx, messages: [{ role: 'user', content: 'は vs が?' }] }
    expect(validateRequest(ok)).toBeNull()
    expect(validateRequest({ ...ok, mode: 'hack' })).not.toBeNull()
    expect(validateRequest({ ...ok, messages: [] })).not.toBeNull()
    expect(validateRequest({ ...ok, messages: [{ role: 'assistant', content: 'x' }] })).not.toBeNull()
    expect(validateRequest({ ...ok, messages: [{ role: 'user', content: 'x'.repeat(30_000) }] })).not.toBeNull()
    expect(validateRequest(null)).not.toBeNull()
  })
  it('offline fallbacks use only real lesson data', () => {
    expect(searchReference('ほど').some((h) => h.title.includes('ほど'))).toBe(true)
    expect(searchReference('zzzzqq')).toEqual([])
    const state = emptyLearnerState()
    expect(challengeFromWeaknesses(state)).toEqual([])
    state.attempts.push({ id: '1', exerciseKey: 'x', conceptKey: 'conditional.to', conceptLabel: 'Conditional ～と', skill: 'grammar', level: 'n4', response: null, isCorrect: false, attemptedAt: new Date().toISOString() })
    const drill = challengeFromWeaknesses(state)
    expect(drill.length).toBeGreaterThan(0)
    expect(drill.every((e) => e.conceptKey === 'conditional.to')).toBe(true)
    expect(buildContext(state).weakConcepts).toEqual(['Conditional ～と'])
  })
})
