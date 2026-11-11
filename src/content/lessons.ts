import { CURRICULUM } from '@/modules/curriculum/structure'
import type { Lesson } from '@/modules/lessons/types'
import { LEVELS, type LessonCompletion, type Level } from '@/modules/learner/types'
import { KANA_LESSONS } from './kana'
import { CORE_LESSONS } from './lessons-core'

/** All published lessons, in curriculum order (level → module order → file order). */
export const LESSONS: Lesson[] = [...KANA_LESSONS, ...CORE_LESSONS]
  .map((lesson, i) => ({ lesson, i }))
  .sort((a, b) => {
    const level = LEVELS.indexOf(a.lesson.level) - LEVELS.indexOf(b.lesson.level)
    if (level) return level
    const mods = CURRICULUM.find((l) => l.level === a.lesson.level)!.modules.map((m) => m.slug)
    return mods.indexOf(a.lesson.module) - mods.indexOf(b.lesson.module) || a.i - b.i
  })
  .map((x) => x.lesson)

export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug)
export const lessonsIn = (level: Level, module?: string) => LESSONS.filter((l) => l.level === level && (!module || l.module === module))

export const isCompleted = (slug: string, completions: LessonCompletion[]) => completions.some((c) => c.slug === slug)

/** The next lesson to study: first uncompleted from the learner's level upward, else first uncompleted anywhere. */
export function nextLesson(level: Level, completions: LessonCompletion[]): Lesson | null {
  const open = LESSONS.filter((l) => !isCompleted(l.slug, completions))
  return open.find((l) => LEVELS.indexOf(l.level) >= LEVELS.indexOf(level)) ?? open[0] ?? null
}

export function levelProgress(level: Level, completions: LessonCompletion[]) {
  const all = lessonsIn(level)
  return { done: all.filter((l) => isCompleted(l.slug, completions)).length, total: all.length }
}
