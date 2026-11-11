import { z } from 'zod'

export const LEVELS = ['foundation', 'n5', 'n4', 'n3', 'n2', 'n1'] as const
export const levelSchema = z.enum(LEVELS)
export type Level = z.infer<typeof levelSchema>

export const LEVEL_LABEL: Record<Level, string> = {
  foundation: 'Foundation',
  n5: 'JLPT N5',
  n4: 'JLPT N4',
  n3: 'JLPT N3',
  n2: 'JLPT N2',
  n1: 'JLPT N1',
}

export const skillSchema = z.enum(['kana', 'vocabulary', 'kanji', 'grammar', 'reading', 'listening', 'speaking', 'writing'])
export type Skill = z.infer<typeof skillSchema>

export const goalsSchema = z.object({
  primaryGoal: z.enum(['jlpt', 'communication', 'academic', 'developer', 'culture']),
  jlptTarget: levelSchema.exclude(['foundation']),
  selfReportedLevel: z.enum(['none', 'kana', 'n5', 'n4', 'n3plus']),
  priorExperience: z.enum(['none', 'self-study', 'classes', 'lived-in-japan']),
  dailyMinutes: z.number().int().min(5).max(480),
  learningStyle: z.enum(['comprehensive', 'reading-first', 'conversation-first', 'exam-focused']),
  explanationLanguage: z.enum(['en', 'en-ja', 'ja']),
  intensity: z.enum(['gentle', 'steady', 'intensive']),
})
export type Goals = z.infer<typeof goalsSchema>

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  currentLevel: levelSchema,
  /** How currentLevel was decided — shown to the learner so an estimate is never dressed up as a result. */
  levelSource: z.enum(['placement', 'self-reported']),
  createdAt: z.string(),
})
export type Profile = z.infer<typeof profileSchema>

export const attemptSchema = z.object({
  id: z.string(),
  exerciseKey: z.string(),
  conceptKey: z.string(),
  conceptLabel: z.string(),
  skill: skillSchema,
  level: levelSchema,
  response: z.string().nullable(),
  isCorrect: z.boolean(),
  attemptedAt: z.string(),
})
export type Attempt = z.infer<typeof attemptSchema>

export const sessionSchema = z.object({
  id: z.string(),
  kind: z.enum(['placement', 'lesson', 'revision', 'practice', 'exam', 'reading', 'listening', 'speaking', 'writing', 'sensei', 'kanji', 'tech']),
  startedAt: z.string(),
  endedAt: z.string(),
})
export type Session = z.infer<typeof sessionSchema>

export const assessmentResultSchema = z.object({
  id: z.string(),
  kind: z.enum(['placement']),
  takenAt: z.string(),
  placedLevel: levelSchema,
  bands: z.array(z.object({ level: levelSchema, correct: z.number(), total: z.number(), passed: z.boolean() })),
})
export type AssessmentResult = z.infer<typeof assessmentResultSchema>

export const lessonCompletionSchema = z.object({ slug: z.string(), completedAt: z.string(), correct: z.number(), total: z.number() })
export type LessonCompletion = z.infer<typeof lessonCompletionSchema>

export const cardSchema = z.object({
  id: z.string(),
  kind: z.enum(['vocabulary', 'kanji', 'grammar', 'custom']),
  conceptKey: z.string(),
  front: z.string(),
  reading: z.string().optional(),
  back: z.string(),
  dueAt: z.string(),
  intervalDays: z.number(),
  ease: z.number(),
  repetitions: z.number(),
  lapses: z.number(),
  createdAt: z.string(),
})
export type Card = z.infer<typeof cardSchema>
export const ratingSchema = z.enum(['again', 'hard', 'good', 'easy'])
export type Rating = z.infer<typeof ratingSchema>
export const reviewSchema = z.object({ id: z.string(), cardId: z.string(), rating: ratingSchema, intervalBefore: z.number(), intervalAfter: z.number(), reviewedAt: z.string() })
export type Review = z.infer<typeof reviewSchema>

export const examResultSchema = z.object({
  id: z.string(), level: levelSchema, section: z.string(), timed: z.boolean(),
  correct: z.number(), total: z.number(), seconds: z.number(), takenAt: z.string(),
})
export type ExamResult = z.infer<typeof examResultSchema>

export const diaryEntrySchema = z.object({ id: z.string(), text: z.string(), writtenAt: z.string() })
export const chatMessageSchema = z.object({ role: z.enum(['user', 'assistant']), content: z.string(), at: z.string() })
export type ChatMessage = z.infer<typeof chatMessageSchema>
export const conversationSchema = z.object({ id: z.string(), mode: z.string(), createdAt: z.string(), messages: z.array(chatMessageSchema) })
export type Conversation = z.infer<typeof conversationSchema>

export const learnerStateSchema = z.object({
  version: z.literal(1),
  profile: profileSchema.nullable(),
  goals: goalsSchema.nullable(),
  attempts: z.array(attemptSchema),
  sessions: z.array(sessionSchema),
  assessmentResults: z.array(assessmentResultSchema),
  // Added after v1 shipped; defaults keep earlier saved data readable.
  lessonCompletions: z.array(lessonCompletionSchema).default([]),
  cards: z.array(cardSchema).default([]),
  reviews: z.array(reviewSchema).default([]),
  examResults: z.array(examResultSchema).default([]),
  diary: z.array(diaryEntrySchema).default([]),
  conversations: z.array(conversationSchema).default([]),
  challenge: z.object({ days: z.union([z.literal(30), z.literal(60), z.literal(90)]), startedAt: z.string() }).nullable().default(null),
})
export type LearnerState = z.infer<typeof learnerStateSchema>

export const emptyLearnerState = (): LearnerState => ({
  version: 1,
  profile: null,
  goals: null,
  attempts: [],
  sessions: [],
  assessmentResults: [],
  lessonCompletions: [],
  cards: [],
  reviews: [],
  examResults: [],
  diary: [],
  conversations: [],
  challenge: null,
})
