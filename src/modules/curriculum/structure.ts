import type { Level } from '@/modules/learner/types'

/**
 * Curriculum ARCHITECTURE: levels and module outlines. Lesson content lives in
 * src/content and is counted from the real lesson files (see content/lessons.ts),
 * so a module shows lessons only when they actually exist.
 */
export interface ModuleOutline {
  slug: string
  title: string
  jp: string
  topics: string[]
}
export interface LevelOutline {
  level: Level
  kanji: string
  summary: string
  modules: ModuleOutline[]
}

const m = (slug: string, title: string, jp: string, topics: string[]): ModuleOutline => ({ slug, title, jp, topics })

export const CURRICULUM: LevelOutline[] = [
  {
    level: 'foundation',
    kanji: '礎',
    summary: 'Sounds and scripts: everything needed before the first sentence.',
    modules: [
      m('writing-systems', 'The three scripts', '文字', ['How hiragana, katakana and kanji share a sentence']),
      m('hiragana', 'Hiragana', 'ひらがな', ['46 basic kana', 'Voiced and combined sounds', 'Stroke-order fundamentals']),
      m('katakana', 'Katakana', 'カタカナ', ['46 basic kana', 'Loanword conventions']),
      m('pronunciation', 'Sound and rhythm', '発音', ['Mora', 'Long vowels', 'Double consonants']),
      m('typing', 'Typing Japanese', '入力', ['Romaji input', 'Conversion']),
      m('kanji-intro', 'Meeting kanji', '漢字入門', ['Readings', 'Radicals', 'Stroke order']),
    ],
  },
  {
    level: 'n5',
    kanji: '初',
    summary: 'First sentences: describing, asking and telling about everyday life.',
    modules: [
      m('sentences', 'Basic sentence structure', '文', ['Noun sentences', 'Questions']),
      m('particles', 'Particles', '助詞', ['は・が・を・に・で・へ・と・も']),
      m('adjectives', 'Adjectives', '形容詞', ['い-adjectives', 'な-adjectives', 'Negative and past']),
      m('verbs', 'Verbs', '動詞', ['Verb groups', 'Present and past', 'Negative forms']),
      m('numbers-time', 'Numbers, time and counters', '数', ['Numbers', 'Time', 'Counters']),
      m('n5-words-kanji', 'Everyday vocabulary and basic kanji', '語彙', ['Vocabulary', 'Kanji']),
      m('n5-skills', 'Reading and listening', '読・聴', ['Short texts', 'Slow dialogues']),
    ],
  },
  {
    level: 'n4',
    kanji: '進',
    summary: 'Connecting ideas: longer sentences and everyday conversation.',
    modules: [
      m('te-form', 'The て-form', 'て形', ['Formation', 'Requests, permission, sequence']),
      m('conditionals', 'Conditionals', '条件', ['と・ば・たら・なら']),
      m('potential', 'Potential forms', '可能形', ['Ability and possibility']),
      m('passive-causative', 'Passive and causative foundations', '受身・使役', ['Formation', 'Core uses']),
      m('giving-receiving', 'Giving and receiving', '授受', ['あげる・くれる・もらう', '～てあげる・～てくれる・～てもらう']),
      m('n4-words-kanji', 'Vocabulary and kanji expansion', '語彙', ['Vocabulary', 'Kanji']),
      m('n4-skills', 'Reading and listening comprehension', '読・聴', ['Everyday conversations', 'Short passages']),
    ],
  },
  {
    level: 'n3',
    kanji: '橋',
    summary: 'The bridge to real-world Japanese: nuance, context and stamina.',
    modules: [
      m('n3-grammar', 'N3 grammar', '文法', ['Sentence composition', 'Text grammar']),
      m('n3-vocabulary', 'N3 vocabulary', '語彙', ['Contextual vocabulary', 'Synonyms', 'Word usage']),
      m('n3-kanji', 'N3 kanji', '漢字', ['Readings in context', 'Orthography']),
      m('n3-reading', 'Reading comprehension', '読解', ['Short, mid-length and long passages', 'Information retrieval']),
      m('n3-listening', 'Listening comprehension', '聴解', ['Task-based', 'Key points', 'Quick response']),
      m('n3-exam', 'Timed examination practice', '模試', ['Section practice', 'Full mock structure']),
    ],
  },
  {
    level: 'n2',
    kanji: '深',
    summary: 'Formal and written Japanese; reading for argument and intent.',
    modules: [
      m('n2-grammar', 'Advanced grammar', '文法', ['Formal patterns']),
      m('n2-reading', 'Complex reading', '読解', ['Contextual interpretation']),
      m('n2-listening', 'Sophisticated listening', '聴解', ['Natural speed', 'Implied meaning']),
    ],
  },
  {
    level: 'n1',
    kanji: '極',
    summary: 'Nuance, idiom and register at the level of educated native use.',
    modules: [
      m('n1-grammar', 'Complex grammar', '文法', ['Literary and formal patterns']),
      m('n1-vocabulary', 'Nuanced vocabulary and idiom', '語彙', ['Idiomatic expressions']),
      m('n1-reading', 'Advanced reading', '読解', ['Abstract and critical texts']),
      m('n1-communication', 'Formal communication', '敬語', ['Honorific and humble language in context']),
    ],
  },
]

export const outlineFor = (level: Level) => CURRICULUM.find((l) => l.level === level)!
