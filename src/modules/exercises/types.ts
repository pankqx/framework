import type { Level, Skill } from '@/modules/learner/types'

interface Base {
  key: string
  skill: Skill
  level: Level
  conceptKey: string
  conceptLabel: string
  instruction: string
  /** Reading passage shown above the question (may contain {漢字|かんじ} furigana marks). */
  passage?: string
  /** Japanese text to be spoken by the device's speech synthesis (listening items). */
  audio?: string
}
export interface McqExercise extends Base {
  kind: 'mcq'
  prompt: string
  /** options[0] is correct in content files; display order is shuffled deterministically. */
  options: { text: string; why: string }[]
}
export interface OrderExercise extends Base {
  kind: 'order'
  /** Tokens in the correct order. */
  tokens: string[]
  prompt: string
  why: string
}
export interface TypeExercise extends Base {
  kind: 'type'
  prompt: string
  accept: string[]
  why: string
}
export type Exercise = McqExercise | OrderExercise | TypeExercise

type Meta = Pick<Base, 'skill' | 'level'> & Partial<Pick<Base, 'passage' | 'audio'>>

export const mcq = (key: string, meta: Meta, concept: [string, string], instruction: string, prompt: string, options: [string, string][]): McqExercise => ({
  kind: 'mcq', key, ...meta, conceptKey: concept[0], conceptLabel: concept[1], instruction, prompt, options: options.map(([text, why]) => ({ text, why })),
})
export const order = (key: string, meta: Meta, concept: [string, string], prompt: string, tokens: string[], why: string): OrderExercise => ({
  kind: 'order', key, ...meta, conceptKey: concept[0], conceptLabel: concept[1], instruction: 'Put the words in order.', prompt, tokens, why,
})
export const typed = (key: string, meta: Meta, concept: [string, string], instruction: string, prompt: string, accept: string[], why: string): TypeExercise => ({
  kind: 'type', key, ...meta, conceptKey: concept[0], conceptLabel: concept[1], instruction, prompt, accept, why,
})
