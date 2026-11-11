import type { Exercise } from '@/modules/exercises/types'
import type { Level } from '@/modules/learner/types'

export interface Example { jp: string; en: string; note?: string }
export interface VocabItem { term: string; reading: string; meaning: string }
export interface GrammarPoint { pattern: string; meaning: string; note: string }
export interface LessonSection { heading: string; body: string[]; examples?: Example[] }

export interface Lesson {
  slug: string
  level: Level
  module: string
  title: string
  jp: string
  minutes: number
  objective: string
  intro: string
  sections: LessonSection[]
  vocab: VocabItem[]
  grammar: GrammarPoint[]
  application: string
  practice: Exercise[]
  assessment: Exercise[]
  summary: string[]
}

/** Shown on every lesson: where the content comes from and how far it has been checked. */
export const LESSON_PROVENANCE =
  'Original explanations, examples and exercises written for KOTOBA. Not yet reviewed by a qualified native-speaking teacher, and not official JLPT material. Level labels follow common teaching convention.'

/** A lesson counts as completed when the mini assessment is passed. */
export const passMark = (total: number) => Math.ceil(total * 0.66)
