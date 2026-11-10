import type { ChoiceOption } from '@/components/Choice'
import type { Goals } from '@/modules/learner/types'

export const SELF_LEVEL: ChoiceOption<Goals['selfReportedLevel']>[] = [
  { value: 'none', jp: '零', label: 'Starting from zero', hint: 'I cannot read hiragana yet' },
  { value: 'kana', jp: 'あ', label: 'I can read kana', hint: 'Hiragana and katakana, a few words' },
  { value: 'n5', jp: '初', label: 'Around N5', hint: 'Basic sentences, particles, polite forms' },
  { value: 'n4', jp: '進', label: 'Around N4', hint: 'て-form, conditionals, everyday conversation' },
  { value: 'n3plus', jp: '橋', label: 'N3 or beyond', hint: 'Intermediate grammar and reading' },
]
export const EXPERIENCE: ChoiceOption<Goals['priorExperience']>[] = [
  { value: 'none', label: 'None yet' },
  { value: 'self-study', label: 'Self-study', hint: 'Apps, books, videos' },
  { value: 'classes', label: 'Classes or a tutor' },
  { value: 'lived-in-japan', label: 'Lived or worked in Japan' },
]
export const PRIMARY_GOAL: ChoiceOption<Goals['primaryGoal']>[] = [
  { value: 'jlpt', jp: '試', label: 'Pass the JLPT' },
  { value: 'communication', jp: '話', label: 'Practical communication' },
  { value: 'academic', jp: '学', label: 'Academic or professional Japanese' },
  { value: 'developer', jp: '技', label: 'Japanese for software development' },
  { value: 'culture', jp: '文', label: 'Culture, media and travel' },
]
export const TARGET: ChoiceOption<Goals['jlptTarget']>[] = [
  { value: 'n5', label: 'N5' },
  { value: 'n4', label: 'N4' },
  { value: 'n3', label: 'N3' },
  { value: 'n2', label: 'N2' },
  { value: 'n1', label: 'N1' },
]
export const MINUTES: ChoiceOption<number>[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '2 hours' },
]
export const INTENSITY: ChoiceOption<Goals['intensity']>[] = [
  { value: 'gentle', label: 'Gentle', hint: 'More time on recall, less new material' },
  { value: 'steady', label: 'Steady', hint: 'A balanced pace' },
  { value: 'intensive', label: 'Intensive', hint: 'More new material each day' },
]
export const STYLE: ChoiceOption<Goals['learningStyle']>[] = [
  { value: 'comprehensive', label: 'Comprehensive', hint: 'Structured and balanced across every skill' },
  { value: 'reading-first', label: 'Reading first', hint: 'More kanji and text' },
  { value: 'conversation-first', label: 'Conversation first', hint: 'More listening and speaking' },
  { value: 'exam-focused', label: 'Exam focused', hint: 'Weighted towards JLPT sections' },
]
export const EXPLAIN: ChoiceOption<Goals['explanationLanguage']>[] = [
  { value: 'en', label: 'English' },
  { value: 'en-ja', label: 'English, with more Japanese over time' },
  { value: 'ja', label: 'Japanese wherever possible' },
]
