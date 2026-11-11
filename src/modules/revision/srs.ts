import type { Card, Rating } from '@/modules/learner/types'
import type { Lesson } from '@/modules/lessons/types'
import { plain } from '@/components/JP'
import { newId } from '@/lib/id'

/** Spaced-repetition settings. Everything the scheduler does is driven by these numbers. */
export interface SrsConfig {
  againMinutes: number
  firstHardDays: number
  firstGoodDays: number
  firstEasyDays: number
  hardMultiplier: number
  easyBonus: number
  startingEase: number
  minimumEase: number
  /** A card is "mastered" only after this many successful recalls in a row… */
  masteryRepetitions: number
  /** …and once its interval has grown to at least this many days. */
  masteryIntervalDays: number
}
export const DEFAULT_SRS: SrsConfig = {
  againMinutes: 10, firstHardDays: 0.25, firstGoodDays: 1, firstEasyDays: 4,
  hardMultiplier: 1.2, easyBonus: 1.3, startingEase: 2.5, minimumEase: 1.3,
  masteryRepetitions: 3, masteryIntervalDays: 21,
}

const DAY = 86_400_000

/** SM-2 style scheduling: returns the card as it should be after this rating. */
export function schedule(card: Card, rating: Rating, now: Date, cfg: SrsConfig = DEFAULT_SRS): Card {
  let { intervalDays, ease, repetitions, lapses } = card
  if (rating === 'again') {
    intervalDays = cfg.againMinutes / 1440
    ease = Math.max(cfg.minimumEase, ease - 0.2)
    repetitions = 0
    lapses += 1
  } else {
    if (repetitions === 0) {
      intervalDays = rating === 'hard' ? cfg.firstHardDays : rating === 'good' ? cfg.firstGoodDays : cfg.firstEasyDays
    } else if (rating === 'hard') {
      intervalDays = Math.max(intervalDays * cfg.hardMultiplier, cfg.firstHardDays)
    } else {
      intervalDays = Math.max(intervalDays, cfg.firstGoodDays) * ease * (rating === 'easy' ? cfg.easyBonus : 1)
    }
    if (rating === 'hard') ease = Math.max(cfg.minimumEase, ease - 0.15)
    if (rating === 'easy') ease += 0.15
    repetitions += 1
  }
  return { ...card, intervalDays, ease, repetitions, lapses, dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString() }
}

export const isDue = (card: Card, now: Date) => Date.parse(card.dueAt) <= now.getTime()
export const dueCards = (cards: Card[], now: Date) => cards.filter((c) => isDue(c, now)).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
export const upcomingCards = (cards: Card[], now: Date, days = 7) =>
  cards.filter((c) => !isDue(c, now) && Date.parse(c.dueAt) <= now.getTime() + days * DAY)
export const isMastered = (card: Card, cfg: SrsConfig = DEFAULT_SRS) =>
  card.repetitions >= cfg.masteryRepetitions && card.intervalDays >= cfg.masteryIntervalDays
export const masteredCards = (cards: Card[], cfg: SrsConfig = DEFAULT_SRS) => cards.filter((c) => isMastered(c, cfg))

export function newCard(kind: Card['kind'], conceptKey: string, front: string, back: string, now: Date, reading?: string): Card {
  return { id: newId(), kind, conceptKey, front, back, reading, dueAt: now.toISOString(), intervalDays: 0, ease: DEFAULT_SRS.startingEase, repetitions: 0, lapses: 0, createdAt: now.toISOString() }
}

/** Cards a lesson contributes. Existing concept keys are skipped so a retake never duplicates cards. */
export function cardsFromLesson(lesson: Lesson, existing: Card[], now: Date): Card[] {
  const have = new Set(existing.map((c) => c.conceptKey))
  const fresh: Card[] = []
  const add = (card: Card) => {
    if (!have.has(card.conceptKey)) {
      have.add(card.conceptKey)
      fresh.push(card)
    }
  }
  for (const v of lesson.vocab) {
    const term = plain(v.term)
    add(newCard('vocabulary', `vocab:${term}`, term, v.meaning, now, v.reading !== term ? v.reading : undefined))
  }
  for (const g of lesson.grammar) add(newCard('grammar', `grammar:${g.pattern}`, g.pattern, `${g.meaning} — ${g.note}`, now))
  return fresh
}

export function formatInterval(days: number): string {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))} min`
  if (days < 1) return `${Math.round(days * 24)} h`
  if (days < 30) return `${Math.round(days)} d`
  return `${(days / 30).toFixed(1)} mo`
}
