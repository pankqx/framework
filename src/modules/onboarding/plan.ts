import { LEVELS, type Goals, type Level } from '@/modules/learner/types'

export interface PlanBlock {
  key: 'new' | 'revision' | 'kanji' | 'reading' | 'listening' | 'kana'
  label: string
  detail: string
  minutes: number
}
export interface LearningPlan {
  path: Level[]
  blocks: PlanBlock[]
  dailyMinutes: number
  weeklyMinutes: number
}

type Weights = Partial<Record<PlanBlock['key'], number>>

const STYLE_WEIGHTS: Record<Goals['learningStyle'], Weights> = {
  comprehensive: { new: 35, revision: 25, kanji: 15, reading: 15, listening: 10 },
  'reading-first': { new: 30, revision: 20, kanji: 20, reading: 25, listening: 5 },
  'conversation-first': { new: 30, revision: 20, kanji: 10, reading: 10, listening: 30 },
  'exam-focused': { new: 30, revision: 25, kanji: 15, reading: 20, listening: 10 },
}
const FOUNDATION_WEIGHTS: Weights = { kana: 50, revision: 30, listening: 20 }

const BLOCK_COPY: Record<PlanBlock['key'], [string, string]> = {
  kana: ['Kana', 'Learn and write new characters'],
  new: ['New material', 'Today’s lesson: grammar and vocabulary'],
  revision: ['Revision', 'Spaced recall of what you have met'],
  kanji: ['Kanji', 'Readings, writing and compounds'],
  reading: ['Reading', 'Graded passages'],
  listening: ['Listening & speaking', 'Audio, shadowing and response'],
}

export function learningPath(current: Level, target: Level): Level[] {
  const from = LEVELS.indexOf(current)
  const to = LEVELS.indexOf(target)
  return to <= from ? [current] : LEVELS.slice(from, to + 1)
}

/** Split `total` whole minutes by weight (largest-remainder), so blocks always sum to the total. */
export function allocate(total: number, weights: Weights): Record<string, number> {
  const entries = Object.entries(weights) as [string, number][]
  const sum = entries.reduce((n, [, w]) => n + w, 0)
  const exact = entries.map(([k, w]) => [k, (total * w) / sum] as const)
  const result: Record<string, number> = Object.fromEntries(exact.map(([k, v]) => [k, Math.floor(v)]))
  let left = total - Object.values(result).reduce((a, b) => a + b, 0)
  for (const [k] of [...exact].sort((a, b) => (b[1] % 1) - (a[1] % 1))) {
    if (left-- <= 0) break
    result[k] = (result[k] ?? 0) + 1
  }
  return result
}

export function generatePlan(goals: Goals, currentLevel: Level): LearningPlan {
  let weights: Weights = currentLevel === 'foundation' ? { ...FOUNDATION_WEIGHTS } : { ...STYLE_WEIGHTS[goals.learningStyle] }

  // Intensity moves time between meeting new material and consolidating it.
  const lead = currentLevel === 'foundation' ? 'kana' : 'new'
  const shift = goals.intensity === 'gentle' ? -5 : goals.intensity === 'intensive' ? 5 : 0
  weights[lead] = (weights[lead] ?? 0) + shift
  weights.revision = (weights.revision ?? 0) - shift

  // Very short sessions are not sliced into fragments: one thing to learn, one thing to recall.
  if (goals.dailyMinutes < 20) weights = { [lead]: 60, revision: 40 }

  const minutes = allocate(goals.dailyMinutes, weights)
  const blocks = (Object.keys(weights) as PlanBlock['key'][])
    .map((key) => ({ key, label: BLOCK_COPY[key][0], detail: BLOCK_COPY[key][1], minutes: minutes[key] ?? 0 }))
    .filter((b) => b.minutes > 0)

  return {
    path: learningPath(currentLevel, goals.jlptTarget),
    blocks,
    dailyMinutes: goals.dailyMinutes,
    weeklyMinutes: goals.dailyMinutes * 7,
  }
}
