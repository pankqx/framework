import { mcq, typed, type Exercise } from '@/modules/exercises/types'
import { shuffled } from '@/modules/exercises/evaluate'
import type { Lesson } from '@/modules/lessons/types'

const ROMAJI = ['a i u e o', 'ka ki ku ke ko', 'sa shi su se so', 'ta chi tsu te to', 'na ni nu ne no', 'ha hi fu he ho', 'ma mi mu me mo', 'ya yu yo', 'ra ri ru re ro', 'wa o n'].map((r) => r.split(' '))
const HIRA = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'やゆよ', 'らりるれろ', 'わをん'].map((r) => [...r])
const KATA = ['アイウエオ', 'カキクケコ', 'サシスセソ', 'タチツテト', 'ナニヌネノ', 'ハヒフヘホ', 'マミムメモ', 'ヤユヨ', 'ラリルレロ', 'ワヲン'].map((r) => [...r])
const ROW_NAME = ['vowels', 'K', 'S', 'T', 'N', 'H', 'M', 'Y', 'R', 'W + ん']

const HIRA_WORDS: [string, string, string][][] = [
  [['あい', 'ai', 'love'], ['いえ', 'ie', 'house']],
  [['あかい', 'akai', 'red'], ['えき', 'eki', 'station']],
  [['すし', 'sushi', 'sushi'], ['あさ', 'asa', 'morning']],
  [['て', 'te', 'hand'], ['つくえ', 'tsukue', 'desk']],
  [['なに', 'nani', 'what'], ['いぬ', 'inu', 'dog']],
  [['はな', 'hana', 'flower'], ['ふね', 'fune', 'boat']],
  [['みみ', 'mimi', 'ear'], ['むし', 'mushi', 'insect']],
  [['やま', 'yama', 'mountain'], ['ゆき', 'yuki', 'snow']],
  [['さくら', 'sakura', 'cherry blossom'], ['よる', 'yoru', 'night']],
  [['わたし', 'watashi', 'I / me'], ['ほん', 'hon', 'book']],
]
const KATA_WORDS: [string, string, string][][] = [
  [['エア', 'ea', 'air']],
  [['カカオ', 'kakao', 'cacao'], ['キウイ', 'kiui', 'kiwi fruit']],
  [['アイス', 'aisu', 'ice cream'], ['スイカ', 'suika', 'watermelon']],
  [['テスト', 'tesuto', 'test'], ['タコ', 'tako', 'octopus']],
  [['ネコ', 'neko', 'cat (often written in katakana)'], ['カヌー', 'kanū', 'canoe (ー lengthens the vowel)']],
  [['ヘア', 'hea', 'hair'], ['ホスト', 'hosuto', 'host']],
  [['メモ', 'memo', 'memo'], ['トマト', 'tomato', 'tomato']],
  [['タイヤ', 'taiya', 'tyre'], ['ユニフォーム', 'yunifōmu', 'uniform (uses small ォ and ー, met later)']],
  [['カメラ', 'kamera', 'camera'], ['ホテル', 'hoteru', 'hotel'], ['ミルク', 'miruku', 'milk']],
  [['ワイン', 'wain', 'wine'], ['レモン', 'remon', 'lemon']],
]

const NOTES: Record<string, string> = {
  shi: 'This sound is “shi”, not “si”.', chi: 'This sound is “chi”, not “ti”.', tsu: 'This sound is “tsu”, not “tu”.',
  fu: 'Closer to “fu” made with both lips than to an English “hu”.', n: 'ん is the only kana that is a consonant alone; it takes one full beat.',
  o: 'を is pronounced “o” and is used only as the object particle.',
}

function kanaLesson(script: 'hiragana' | 'katakana', row: number): Lesson {
  const table = script === 'hiragana' ? HIRA : KATA
  const chars = table[row]!
  const sounds = ROMAJI[row]!
  const known = table.slice(0, row + 1).flat()
  const knownSounds = ROMAJI.slice(0, row + 1).flat()
  const pool = table.flat()
  const poolSounds = ROMAJI.flat()
  const slug = `${script}-${row + 1}`
  const meta = { skill: 'kana' as const, level: 'foundation' as const }
  const concept = (i: number): [string, string] => [`kana.${script}.${sounds[i] === 'o' && row === 9 ? 'wo' : sounds[i]}`, `${chars[i]} (${sounds[i]})`]
  const say = (s: string, r: number) => (r === 9 && s === 'o' ? 'o (wo)' : s)

  const recognise: Exercise[] = chars.map((ch, i) => {
    const others = shuffled([...new Set(poolSounds)].filter((s) => s !== sounds[i]), `${slug}-r-${i}`).slice(0, 3)
    return mcq(`${slug}-read-${i}`, meta, concept(i), 'How is this character read?', ch, [
      [say(sounds[i]!, row), `${ch} is read “${sounds[i]}”. ${NOTES[sounds[i]!] ?? ''}`.trim()],
      ...others.map((s): [string, string] => [s, `“${s}” is written ${pool[poolSounds.indexOf(s)]}.`]),
    ])
  })
  const produce: Exercise[] = chars.map((ch, i) => {
    const others = shuffled(pool.filter((c) => c !== ch && poolSounds[pool.indexOf(c)] !== sounds[i]), `${slug}-p-${i}`).slice(0, 3)
    return mcq(`${slug}-find-${i}`, meta, concept(i), 'Which character has this sound?', say(sounds[i]!, row), [
      [ch, `${ch} is “${sounds[i]}”.`],
      ...others.map((c): [string, string] => [c, `${c} is read “${poolSounds[pool.indexOf(c)]}”.`]),
    ])
  })
  const typing: Exercise[] = chars.map((ch, i) =>
    typed(`${slug}-type-${i}`, meta, concept(i), 'Type the reading in romaji.', ch, row === 9 && sounds[i] === 'o' ? ['o', 'wo'] : sounds[i] === 'n' ? ['n', 'nn'] : [sounds[i]!], `${ch} is read “${sounds[i]}”. ${NOTES[sounds[i]!] ?? ''}`.trim()),
  )
  const words = (script === 'hiragana' ? HIRA_WORDS : KATA_WORDS)[row]!
  const reviewMix = row === 0 ? [] : shuffled(known.slice(0, -chars.length), `${slug}-mix`).slice(0, 2).map((ch, i) => {
    const s = knownSounds[known.indexOf(ch)]!
    return typed(`${slug}-mix-${i}`, meta, [`kana.${script}.${s}`, `${ch} (${s})`], 'Earlier row — type the reading in romaji.', ch, [s], `${ch} is read “${s}”.`)
  })

  return {
    slug,
    level: 'foundation',
    module: script,
    title: `${script === 'hiragana' ? 'Hiragana' : 'Katakana'}: the ${ROW_NAME[row]} row`,
    jp: chars.join(''),
    minutes: 8,
    objective: `Read and recognise ${chars.join(' ')} without hesitation.`,
    intro:
      script === 'hiragana'
        ? 'Hiragana is the script Japanese grammar is written in. Each character is one beat (mora) and always has the same sound.'
        : 'Katakana has the same sounds as hiragana, drawn with straighter strokes. It is used mainly for loanwords, foreign names and emphasis.',
    sections: [
      {
        heading: 'The characters',
        body: [
          `This row has ${chars.length} characters: ${chars.map((c, i) => `${c} = ${sounds[i]}`).join(', ')}.`,
          ...sounds.filter((s) => NOTES[s]).map((s) => NOTES[s]!),
          'Say each one aloud as you look at it. Every kana takes the same length of time to say.',
        ],
        examples: words.map(([jp, romaji, en]) => ({ jp, en: `${romaji} — ${en}` })),
      },
    ],
    vocab: [],
    grammar: [],
    application: `Write the row from memory on paper: ${sounds.join(', ')}. Then read the example words aloud without looking at the romaji.`,
    practice: [...recognise, ...produce.slice(0, 3)],
    assessment: [...typing, ...reviewMix],
    summary: [`${chars.join(' ')} are read ${sounds.join(', ')}.`, 'One kana, one beat, one sound.'],
  }
}

export const KANA_TABLE = { HIRA, KATA, ROMAJI }
export const KANA_LESSONS: Lesson[] = [
  ...HIRA.map((_, row) => kanaLesson('hiragana', row)),
  ...KATA.map((_, row) => kanaLesson('katakana', row)),
]
