import { mcq, order, type Exercise } from '@/modules/exercises/types'
import type { Level } from '@/modules/learner/types'
import { LISTENING, PASSAGES } from './studio'

export type ExamLevel = Extract<Level, 'n5' | 'n4' | 'n3'>
export type ExamSection = 'vocabulary' | 'grammar-reading' | 'listening'

/**
 * Official test times in minutes (source: jlpt.jp, "Test sections and test times", revised December 2020).
 * Shown for reference. KOTOBA's question sets are far shorter than a real paper.
 */
export const OFFICIAL_MINUTES: Record<ExamLevel, Record<ExamSection, number>> = {
  n5: { vocabulary: 20, 'grammar-reading': 40, listening: 30 },
  n4: { vocabulary: 25, 'grammar-reading': 55, listening: 35 },
  n3: { vocabulary: 30, 'grammar-reading': 70, listening: 40 },
}
export const SECTION_LABEL: Record<ExamSection, [string, string]> = {
  vocabulary: ['言語知識（文字・語彙）', 'Language knowledge — vocabulary'],
  'grammar-reading': ['言語知識（文法）・読解', 'Language knowledge — grammar · reading'],
  listening: ['聴解', 'Listening'],
}
/** Practice pacing per question, in seconds. Not an official figure. */
export const PACE_SECONDS: Record<ExamSection, number> = { vocabulary: 45, 'grammar-reading': 100, listening: 75 }

const V = (level: ExamLevel) => ({ skill: 'vocabulary' as const, level })
const G = (level: ExamLevel) => ({ skill: 'grammar' as const, level })

// All questions are original, written in the style of the published question types.
const VOCAB: Exercise[] = [
  mcq('jl-n5-v1', V('n5'), ['jlpt.kanji-reading', '漢字読み · Kanji reading'], 'How is 学生 read?', 'わたしは 学生です。', [['がくせい', '学生 is がくせい.'], ['がっせい', 'There is no small っ in this word.'], ['かくせい', 'The first sound is voiced: が.'], ['がくしょう', '生 is read せい here.']]),
  mcq('jl-n5-v2', V('n5'), ['jlpt.orthography', '表記 · Orthography'], 'How is やま written?', 'やまに のぼります。', [['山', '山 is やま, mountain.'], ['川', '川 is かわ, river.'], ['出', '出 is で(る), to go out.'], ['上', '上 is うえ, above.']]),
  mcq('jl-n5-v3', V('n5'), ['jlpt.context', '文脈規定 · Contextually-defined expressions'], 'Choose the word that fits.', 'へやが くらいですから、でんきを（　）ください。', [['つけて', 'でんきを つける: to turn the light on.'], ['けして', 'けす is to turn off, which would make it darker.'], ['あけて', 'あける is to open (doors, windows).'], ['しめて', 'しめる is to close.']]),
  mcq('jl-n5-v4', V('n5'), ['jlpt.paraphrase', '言い換え類義 · Paraphrases'], 'Which sentence means the same?', 'この へやは きたないです。', [['この へやは きれいじゃありません。', 'きたない (dirty) = not きれい (clean).'], ['この へやは しずかじゃありません。', 'しずか is about noise.'], ['この へやは ひろくないです。', 'ひろい is about size.'], ['この へやは あかるくないです。', 'あかるい is about light.']]),
  mcq('jl-n4-v1', V('n4'), ['jlpt.kanji-reading', '漢字読み · Kanji reading'], 'How is 旅行 read?', '来週 旅行します。', [['りょこう', '旅行 is りょこう.'], ['りょうこう', 'The first syllable is short: りょ.'], ['りょこ', 'The last vowel is long: こう.'], ['たびゆき', '旅行 uses its on’yomi readings.']]),
  mcq('jl-n4-v2', V('n4'), ['jlpt.orthography', '表記 · Orthography'], 'How is はたらいて written?', 'あには ぎんこうで はたらいて います。', [['働いて', '働く is はたらく, to work.'], ['動いて', '動く is うごく, to move.'], ['重いて', '重 is おも(い), heavy; this is not a word.'], ['種いて', '種 is たね, seed; this is not a word.']]),
  mcq('jl-n4-v3', V('n4'), ['jlpt.context', '文脈規定 · Contextually-defined expressions'], 'Choose the word that fits.', 'やくそくの 時間に（　）ように、早く 家を 出ました。', [['間に合う', '時間に間に合う: to be in time.'], ['似合う', '似合う is to suit (clothes).'], ['知り合う', '知り合う is to get to know someone.'], ['話し合う', '話し合う is to discuss.']]),
  mcq('jl-n4-v4', V('n4'), ['jlpt.paraphrase', '言い換え類義 · Paraphrases'], 'Which sentence means the same?', '田中さんは るすです。', [['田中さんは 今 家に いません。', 'るす means being away from home.'], ['田中さんは 今 ねて います。', 'Sleeping is not being away.'], ['田中さんは 今 いそがしいです。', 'るす says nothing about being busy.'], ['田中さんは 今 元気です。', 'るす is unrelated to health.']]),
  mcq('jl-n3-v1', V('n3'), ['jlpt.kanji-reading', '漢字読み · Kanji reading'], 'How is 経験 read?', '海外で 働いた 経験が ある。', [['けいけん', '経験 is けいけん.'], ['けいげん', '験 is unvoiced here: けん.'], ['きょうけん', '経 is けい in this word.'], ['けっけん', 'There is no small っ.']]),
  mcq('jl-n3-v2', V('n3'), ['jlpt.context', '文脈規定 · Contextually-defined expressions'], 'Choose the word that fits.', '会議の 時間が 変わったら、すぐに（　）ください。', [['知らせて', '知らせる: to let someone know.'], ['調べて', '調べる is to look into.'], ['比べて', '比べる is to compare.'], ['並べて', '並べる is to line things up.']]),
  mcq('jl-n3-v3', V('n3'), ['jlpt.paraphrase', '言い換え類義 · Paraphrases'], 'Which is closest in meaning?', '彼は その 仕事を 断った。', [['引き受けなかった', '断る (to refuse) = did not take it on.'], ['始めた', '始める is to begin.'], ['終えた', '終える is to finish.'], ['手伝った', '手伝う is to help.']]),
  mcq('jl-n3-v4', V('n3'), ['jlpt.usage', '用法 · Usage'], 'Which sentence uses ぐっすり correctly?', 'ぐっすり', [['ゆうべは ぐっすり 眠れた。', 'ぐっすり describes sleeping soundly.'], ['昼ごはんを ぐっすり 食べた。', 'ぐっすり is not used for eating (たっぷり would fit).'], ['雨が ぐっすり 降った。', 'ぐっすり is not used for rain.'], ['駅まで ぐっすり 走った。', 'ぐっすり is not used for running.']]),
]

const GRAMMAR: Exercise[] = [
  mcq('jl-n5-g1', G('n5'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the particle.', 'これは わたし（　）かばんです。', [['の', 'の links the owner to the thing: my bag.'], ['を', 'を marks an object.'], ['に', 'に marks a destination or time.'], ['で', 'で marks place of action or means.']]),
  mcq('jl-n5-g2', G('n5'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the particle.', 'えき（　）がっこうまで あるきます。', [['から', 'から…まで: from … to ….'], ['を', 'を does not pair with まで here.'], ['が', 'が marks a subject.'], ['も', 'も means “also”.']]),
  order('jl-n5-g3', G('n5'), ['jlpt.sentence-composition', '文の文法2 · Sentence composition'], 'Who is the person over there?', ['あそこに', 'いる', 'ひとは', 'だれ', 'ですか'], 'あそこに いる modifies ひと; the question word comes before ですか.'),
  mcq('jl-n5-g4', G('n5'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the word.', 'きのうは あつかったです。きょうは（　）あつくないです。', [['あまり', 'あまり + negative: not very.'], ['とても', 'とても is used with affirmatives.'], ['よく', 'よく means often / well.'], ['たくさん', 'たくさん is about quantity.']]),
  mcq('jl-n4-g1', G('n4'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the form.', '空が 暗く なりました。雨が 降り（　）です。', [['そう', 'ます-stem + そうだ: looks as if it will.'], ['よう', 'ようだ attaches to the plain form (降るようだ).'], ['らしい', 'らしい attaches to the plain form (降るらしい).'], ['みたい', 'みたい attaches to the plain form (降るみたい).']]),
  mcq('jl-n4-g2', G('n4'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the form.', 'この 漢字は 難し（　）、読めません。', [['すぎて', 'Adjective stem + すぎる (too …), in the て-form to give the reason.'], ['すぎる', 'A plain form cannot link the two clauses here.'], ['やすくて', 'やすい attaches to verb stems, not adjectives.'], ['そうに', 'そうに would modify a verb and does not give a reason.']]),
  order('jl-n4-g3', G('n4'), ['jlpt.sentence-composition', '文の文法2 · Sentence composition'], 'I have been to Japan.', ['日本へ', '行った', 'ことが', 'あります'], 'た-form + ことがある expresses experience.'),
  mcq('jl-n4-g4', G('n4'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the form.', '宿題を（　）あとで、遊びに 行きます。', [['した', 'あとで follows the た-form.'], ['する', 'あとで does not follow the dictionary form.'], ['して', 'てから would work, but あとで needs the た-form.'], ['しない', 'A negative does not fit “after doing”.']]),
  mcq('jl-n3-g1', G('n3'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the word.', '子どもの（　）、よく この 川で 遊んだ ものだ。', [['ころ', '子どものころ: when I was a child. ～たものだ recalls a past habit.'], ['うちに', 'うちに means “while still…, before it changes”, and does not pair with a recalled habit.'], ['ばかり', 'ばかり means “only / just”.'], ['ために', 'ために means “for the sake of”.']]),
  mcq('jl-n3-g2', G('n3'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the word.', 'せっかく 作った（　）、だれも 食べて くれなかった。', [['のに', 'のに: “even though” — an unexpected, disappointing result. せっかく often pairs with it.'], ['ので', 'ので gives a cause, but the result here is contrary to expectation.'], ['から', 'から gives a reason, not a contrast.'], ['ために', 'ために expresses purpose or cause.']]),
  order('jl-n3-g3', G('n3'), ['jlpt.sentence-composition', '文の文法2 · Sentence composition'], 'I do not know whether he will come.', ['彼が', '来るか', 'どうか', 'わからない'], '～かどうか: whether or not.'),
  mcq('jl-n3-g4', G('n3'), ['jlpt.sentence-grammar', '文の文法1 · Sentential grammar'], 'Choose the expression.', 'この 薬は 一日に 三回 飲む（　）。', [['ことに なっている', 'ことになっている states a rule or instruction.'], ['ように なった', 'ようになった describes a change over time.'], ['ことが ある', 'ことがある means “sometimes”, which conflicts with a fixed dosage.'], ['はずが ない', 'はずがない means “cannot possibly”.']]),
]

export function examQuestions(level: ExamLevel, section: ExamSection): Exercise[] {
  if (section === 'vocabulary') return VOCAB.filter((e) => e.level === level)
  if (section === 'listening') return LISTENING.filter((e) => e.level === level)
  return [...GRAMMAR.filter((e) => e.level === level), ...PASSAGES.filter((p) => p.level === level).flatMap((p) => p.questions)]
}
