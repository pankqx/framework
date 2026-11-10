import { describe, expect, it } from 'vitest'
import { allocate, generatePlan, learningPath } from '@/modules/onboarding/plan'
import type { Goals } from '@/modules/learner/types'

const goals = (over: Partial<Goals> = {}): Goals => ({
  primaryGoal: 'jlpt', jlptTarget: 'n3', selfReportedLevel: 'n5', priorExperience: 'self-study',
  dailyMinutes: 45, learningStyle: 'comprehensive', explanationLanguage: 'en', intensity: 'steady', ...over,
})

describe('learning plan', () => {
  it('builds the path from current level to target', () => {
    expect(learningPath('foundation', 'n3')).toEqual(['foundation', 'n5', 'n4', 'n3'])
    expect(learningPath('n3', 'n3')).toEqual(['n3'])
    expect(learningPath('n3', 'n5')).toEqual(['n3'])
  })
  it('allocates exactly the available minutes for every time/style/intensity', () => {
    for (const dailyMinutes of [5, 15, 30, 45, 60, 90, 120, 77])
      for (const learningStyle of ['comprehensive', 'reading-first', 'conversation-first', 'exam-focused'] as const)
        for (const intensity of ['gentle', 'steady', 'intensive'] as const)
          for (const level of ['foundation', 'n4'] as const) {
            const plan = generatePlan(goals({ dailyMinutes, learningStyle, intensity }), level)
            expect(plan.blocks.reduce((n, b) => n + b.minutes, 0)).toBe(dailyMinutes)
            expect(plan.blocks.every((b) => b.minutes > 0)).toBe(true)
          }
  })
  it('teaches kana first at foundation and keeps short days to two blocks', () => {
    expect(generatePlan(goals(), 'foundation').blocks[0]?.key).toBe('kana')
    expect(generatePlan(goals({ dailyMinutes: 15 }), 'n5').blocks.map((b) => b.key)).toEqual(['new', 'revision'])
  })
  it('gives intensive learners more new material than gentle ones', () => {
    const minutes = (intensity: Goals['intensity']) => generatePlan(goals({ intensity, dailyMinutes: 60 }), 'n5').blocks.find((b) => b.key === 'new')!.minutes
    expect(minutes('intensive')).toBeGreaterThan(minutes('gentle'))
  })
  it('largest-remainder allocation sums to the total', () => {
    expect(Object.values(allocate(10, { new: 1, revision: 1, kanji: 1 })).reduce((x, y) => x + y, 0)).toBe(10)
  })
})
