import type { AssessmentResult, Level, Skill } from '@/modules/learner/types'

/**
 * Placement assessment. All items are original to KOTOBA. Level tags follow
 * common teaching convention — the JLPT has published no official
 * vocabulary/grammar lists since 2010 — so placement is an estimate, never a JLPT score.
 */
export interface PlacementOption {
  id: string
  text: string
  /** Why this option is right or wrong — shown after answering. */
  why: string
}
export interface PlacementQuestion {
  key: string
  level: PlacementBand
  skill: Skill
  conceptKey: string
  conceptLabel: string
  instruction: string
  prompt: string
  options: PlacementOption[]
  answerId: string
}
export type PlacementBand = Extract<Level, 'foundation' | 'n5' | 'n4' | 'n3'>
export const BANDS: PlacementBand[] = ['foundation', 'n5', 'n4', 'n3']
export const PASS_MARK = 3 // of 4 per band

const q = (
  key: string,
  level: PlacementBand,
  skill: Skill,
  conceptKey: string,
  conceptLabel: string,
  instruction: string,
  prompt: string,
  options: [string, string][],
): PlacementQuestion => ({
  key,
  level,
  skill,
  conceptKey,
  conceptLabel,
  instruction,
  prompt,
  // First option listed is the correct one; display order is fixed per question below.
  options: options.map(([text, why], i) => ({ id: `${key}-${i}`, text, why })),
  answerId: `${key}-0`,
})

const RAW: PlacementQuestion[] = [
  // ---------- Foundation: kana ----------
  q('f1', 'foundation', 'kana', 'kana.hiragana.lookalikes', 'Hiragana look-alikes (ね・れ・わ・ぬ)', 'How is this hiragana read?', 'ね', [
    ['ne', 'ね ends in a small loop on the right — that loop marks ne.'],
    ['re', 're is れ: the same start, but the tail flicks outward with no loop.'],
    ['wa', 'wa is わ: the same start, but the right side is an open curve.'],
    ['nu', 'nu is ぬ: it has a loop too, but begins with two crossing strokes like め.'],
  ]),
  q('f2', 'foundation', 'kana', 'kana.katakana.shi-tsu', 'Katakana シ / ツ / ン / ソ', 'How is this katakana read?', 'シ', [
    ['shi', 'In シ the short strokes are stacked vertically and the long stroke sweeps up from the bottom-left.'],
    ['tsu', 'tsu is ツ: its short strokes sit side by side along the top, and the long stroke falls from the top-right.'],
    ['n', 'n is ン: it has only one short stroke.'],
    ['so', 'so is ソ: one short stroke, with the long stroke falling from the top-right.'],
  ]),
  q('f3', 'foundation', 'kana', 'pron.long-vowels', 'Long vowels', 'Which word means “grandmother”?', 'grandmother', [
    ['おばあさん', 'The long あ (ばあ) is what makes this “grandmother”. Vowel length changes the word.'],
    ['おばさん', 'With a short あ, おばさん means “aunt”.'],
    ['おじいさん', 'おじいさん is “grandfather” (long い).'],
    ['おじさん', 'おじさん is “uncle”.'],
  ]),
  q('f4', 'foundation', 'kana', 'pron.double-consonants', 'Small っ (double consonants)', 'How is this word read?', 'きって', [
    ['kitte', 'The small っ doubles the next consonant: き + っ + て = kitte (“stamp”). It takes one full beat.'],
    ['kite', 'kite would be written きて, with no small っ.'],
    ['kitsute', 'A full-size つ is read tsu, but the small っ is not pronounced — it only holds a beat.'],
    ['kiite', 'kiite would be written きいて, with a long い.'],
  ]),

  // ---------- N5 ----------
  q('n5-1', 'n5', 'grammar', 'particle.wa-topic', 'Topic particle は', 'Choose the particle.', 'わたし（　）がくせいです。', [
    ['は', 'は marks the topic: “As for me, (I) am a student.”'],
    ['を', 'を marks the direct object of an action verb. です is not an action done to something.'],
    ['に', 'に marks a destination, time or location of existence — none applies here.'],
    ['で', 'で marks where an action happens or the means used.'],
  ]),
  q('n5-2', 'n5', 'grammar', 'verb.past-polite', 'Polite past ～ました', 'Choose the verb form.', 'きのう、えいがを（　）。', [
    ['みました', 'きのう (yesterday) needs the past: みます → みました.'],
    ['みます', 'みます is non-past (present/future); it conflicts with きのう.'],
    ['みて', 'The て-form connects to something else; it cannot end a polite sentence by itself.'],
    ['みましょう', 'みましょう means “let’s watch” — a suggestion, not a past event.'],
  ]),
  q('n5-3', 'n5', 'grammar', 'particle.ni-location', 'Location of existence に', 'Choose the particle.', 'つくえの うえ（　）ほんが あります。', [
    ['に', 'With あります / います, the place where something exists takes に.'],
    ['で', 'で marks where an action takes place. Existing is a state, so あります uses に.'],
    ['を', 'を marks a direct object; あります has none.'],
    ['へ', 'へ marks direction of movement; nothing is moving here.'],
  ]),
  q('n5-4', 'n5', 'grammar', 'adjective.i-negative', 'Negative of い-adjectives', 'Choose the correct negative.', 'この ケーキは（　）。', [
    ['おいしくないです', 'い-adjectives drop い and add くない: おいしい → おいしくない.'],
    ['おいしいじゃないです', 'じゃない negates nouns and な-adjectives, not い-adjectives.'],
    ['おいしいくないです', 'The final い must be removed before adding くない.'],
    ['おいしくじゃないです', 'This mixes the two negative patterns; い-adjectives only use くない.'],
  ]),

  // ---------- N4 ----------
  q('n4-1', 'n4', 'grammar', 'te-form.permission', 'て-form + もいいですか', 'Choose the verb form.', 'ここで しゃしんを（　）も いいですか。', [
    ['とって', 'とる is a group-1 verb ending in る, so its て-form is とって. ～てもいいですか asks permission.'],
    ['とりて', 'The ます-stem + て is not how group-1 verbs form て; る becomes って.'],
    ['とんで', 'んで is the て-form ending for verbs in む・ぶ・ぬ. とんで is from とぶ (to fly).'],
    ['とった', 'とった is the plain past. ～もいいですか needs the て-form.'],
  ]),
  q('n4-2', 'n4', 'grammar', 'verb.potential', 'Potential form', 'Choose the verb form.', 'A：がっきが できますか。　B：はい、ピアノが（　）。', [
    ['ひけます', 'The potential form of ひく is ひける (“can play”), and the thing you can do is marked with が.'],
    ['ひきます', 'ひきます states that you play, and would take を. The question asks about ability.'],
    ['ひかせます', 'ひかせます is causative: “make/let someone play”.'],
    ['ひかれます', 'ひかれます is passive: “is played”. It does not express ability for this verb group.'],
  ]),
  q('n4-3', 'n4', 'grammar', 'giving-receiving.kureru', 'Giving and receiving: くれる', 'Choose the verb.', 'ともだちが わたしに ほんを（　）。', [
    ['くれました', 'When someone gives to me (or my side), the giver is the subject and the verb is くれる.'],
    ['あげました', 'あげる is for giving away from the speaker’s side. It is not used when the receiver is わたし.'],
    ['もらいました', 'もらう takes the receiver as the subject: わたしは ともだちに ほんを もらいました.'],
    ['やりました', 'やる is giving to a junior, an animal or a plant — never to oneself.'],
  ]),
  q('n4-4', 'n4', 'grammar', 'conditional.to', 'Conditional ～と', 'Choose the form.', 'この ボタンを（　）、ドアが あきます。', [
    ['おすと', 'Dictionary form + と expresses an automatic result: whenever you press, the door opens.'],
    ['おすのに', 'のに means “even though”, which would make the result unexpected.'],
    ['おしたり', '～たり lists example actions and needs する to complete it.'],
    ['おしながら', '～ながら means doing two things at once with the same subject; the door is a different subject.'],
  ]),

  // ---------- N3 ----------
  q('n3-1', 'n3', 'grammar', 'grammar.you-ni-suru', '～ようにしている', 'Choose the expression.', 'わたしは 健康のために、毎日 野菜を 食べる（　）。', [
    ['ようにしています', '～ようにしている expresses a habit you make a deliberate effort to keep.'],
    ['ことがあります', 'Dictionary form + ことがある means “sometimes”, which contradicts 毎日.'],
    ['はずです', 'はず expresses the speaker’s expectation about something not directly controlled — odd for your own habit.'],
    ['らしいです', 'らしい reports what you have heard or inferred about others, not your own routine.'],
  ]),
  q('n3-2', 'n3', 'grammar', 'grammar.ba-hodo', '～ば～ほど', 'Choose the word.', '日本語は 勉強すれば する（　）おもしろくなる。', [
    ['ほど', '～ば～ほど is a fixed pattern: “the more you…, the more…”.'],
    ['だけ', 'だけ (“only / as much as”) does not pair with the repeated ～ば form.'],
    ['ばかり', 'ばかり means “nothing but” or “just did”; it does not form this comparison.'],
    ['くらい', 'くらい expresses approximate degree but cannot replace ほど in ～ば～ほど.'],
  ]),
  q('n3-3', 'n3', 'vocabulary', 'vocab.context.shimekiri', 'Contextual vocabulary: 締め切り', 'Choose the word that fits.', 'レポートの（　）は 金曜日です。', [
    ['締め切り', '締め切り（しめきり）means “deadline” — the natural word for when a report is due.'],
    ['割引', '割引（わりびき）means “discount”.'],
    ['受付', '受付（うけつけ）means “reception desk” or “acceptance (of applications)”; it is not a date.'],
    ['行き先', '行き先（いきさき）means “destination”.'],
  ]),
  q('n3-4', 'n3', 'grammar', 'grammar.koto-ni-naru', '～ことになる', 'Choose the expression.', '来月から 大阪に 転勤する（　）。', [
    ['ことになりました', '～ことになる reports a decision made by circumstances or others — typical for a job transfer.'],
    ['ことがあります', 'ことがある means “sometimes happens”; it cannot refer to one event starting 来月.'],
    ['ところでした', '～ところだった means “was about to (but didn’t)”, which clashes with a future plan.'],
    ['ようにしました', '～ようにする is your own effort to do something; a transfer is decided for you.'],
  ]),
]

/** Deterministic shuffle so option order is stable per question but the answer is not always first. */
function rotate<T>(items: T[], by: number): T[] {
  const n = by % items.length
  return [...items.slice(n), ...items.slice(0, n)]
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = RAW.map((item, i) => ({
  ...item,
  options: rotate(item.options, (i * 3 + 1) % 4),
}))

export const questionsForBand = (band: PlacementBand) => PLACEMENT_QUESTIONS.filter((x) => x.level === band)

export type BandScore = AssessmentResult['bands'][number]

export function scoreBand(band: PlacementBand, answers: Record<string, string | null>): BandScore {
  const items = questionsForBand(band)
  const correct = items.filter((item) => answers[item.key] === item.answerId).length
  return { level: band, correct, total: items.length, passed: correct >= PASS_MARK }
}

/**
 * The learner starts at the first band they did not pass. Passing every band
 * still places at N3: this assessment has no evidence about anything above it.
 */
export function placeLevel(bands: BandScore[]): Level {
  for (const band of BANDS) {
    const score = bands.find((b) => b.level === band)
    if (!score || !score.passed) return band
  }
  return 'n3'
}

/** The assessment stops at the first band not passed — harder bands would only invite guessing. */
export function nextBand(bands: BandScore[]): PlacementBand | null {
  const last = bands[bands.length - 1]
  if (!last) return BANDS[0] ?? null
  if (!last.passed) return null
  const index = BANDS.indexOf(last.level as PlacementBand)
  return BANDS[index + 1] ?? null
}

export const SELF_REPORT_TO_LEVEL: Record<string, Level> = {
  none: 'foundation',
  kana: 'n5',
  n5: 'n4',
  n4: 'n3',
  n3plus: 'n3',
}
