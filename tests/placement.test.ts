import { describe, expect, it } from 'vitest'
import { BANDS, nextBand, placeLevel, PLACEMENT_QUESTIONS, questionsForBand, scoreBand, type PlacementBand } from '@/modules/onboarding/placement'

const answerBand = (band: PlacementBand, correctCount: number) => {
  const answers: Record<string, string | null> = {}
  questionsForBand(band).forEach((q, i) => (answers[q.key] = i < correctCount ? q.answerId : null))
  return scoreBand(band, answers)
}

describe('placement content', () => {
  it('has four well-formed questions per band', () => {
    for (const band of BANDS) expect(questionsForBand(band)).toHaveLength(4)
    for (const q of PLACEMENT_QUESTIONS) {
      expect(q.options).toHaveLength(4)
      expect(q.options.filter((o) => o.id === q.answerId)).toHaveLength(1)
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4)
      for (const o of q.options) expect(o.why.length).toBeGreaterThan(10)
    }
    expect(new Set(PLACEMENT_QUESTIONS.map((q) => q.key)).size).toBe(PLACEMENT_QUESTIONS.length)
  })
  it('does not always put the answer in the same position', () => {
    const positions = new Set(PLACEMENT_QUESTIONS.map((q) => q.options.findIndex((o) => o.id === q.answerId)))
    expect(positions.size).toBe(4)
  })
})

describe('placement scoring', () => {
  it('passes a band at 3 of 4 and treats "don\'t know" as incorrect', () => {
    expect(answerBand('n5', 3).passed).toBe(true)
    expect(answerBand('n5', 2)).toMatchObject({ correct: 2, total: 4, passed: false })
  })
  it('stops at the first band not passed', () => {
    expect(nextBand([])).toBe('foundation')
    expect(nextBand([answerBand('foundation', 4)])).toBe('n5')
    expect(nextBand([answerBand('foundation', 4), answerBand('n5', 1)])).toBeNull()
    expect(nextBand(BANDS.map((b) => answerBand(b, 4)))).toBeNull()
  })
  it('places the learner at the first band not passed, capped at N3', () => {
    expect(placeLevel([answerBand('foundation', 0)])).toBe('foundation')
    expect(placeLevel([answerBand('foundation', 4), answerBand('n5', 2)])).toBe('n5')
    expect(placeLevel([answerBand('foundation', 3), answerBand('n5', 4), answerBand('n4', 3), answerBand('n3', 1)])).toBe('n3')
    expect(placeLevel(BANDS.map((b) => answerBand(b, 4)))).toBe('n3')
  })
})
