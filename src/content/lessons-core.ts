import { mcq, order, typed } from '@/modules/exercises/types'
import type { Lesson } from '@/modules/lessons/types'

const F = { skill: 'kana' as const, level: 'foundation' as const }
const G5 = { skill: 'grammar' as const, level: 'n5' as const }
const G4 = { skill: 'grammar' as const, level: 'n4' as const }
const G3 = { skill: 'grammar' as const, level: 'n3' as const }
const V3 = { skill: 'vocabulary' as const, level: 'n3' as const }

export const CORE_LESSONS: Lesson[] = [
  // ───────────── Foundation ─────────────
  {
    slug: 'sound-rhythm', level: 'foundation', module: 'pronunciation', title: 'Long vowels and the small っ', jp: '発音', minutes: 10,
    objective: 'Hear and read the difference that vowel length and doubled consonants make.',
    intro: 'Japanese is counted in beats (mora). Holding a vowel for an extra beat, or pausing for one before a consonant, makes a different word.',
    sections: [
      { heading: 'Long vowels', body: ['A long vowel lasts two beats. In hiragana it is written by adding a vowel kana: ああ, いい, うう, ええ / えい, おお / おう.', 'In katakana a long vowel is written with the bar ー.'],
        examples: [{ jp: 'おばさん / おばあさん', en: 'obasan (aunt) / obaasan (grandmother)' }, { jp: 'ここ / こうこう', en: 'koko (here) / kōkō (high school)' }, { jp: 'コーヒー', en: 'kōhī (coffee)' }] },
      { heading: 'The small っ', body: ['A small っ (ッ in katakana) is not pronounced “tsu”. It holds a silent beat and doubles the consonant that follows.'],
        examples: [{ jp: 'きて / きって', en: 'kite (come!) / kitte (stamp)' }, { jp: 'さか / さっか', en: 'saka (slope) / sakka (writer)' }] },
    ],
    vocab: [{ term: 'おばあさん', reading: 'おばあさん', meaning: 'grandmother' }, { term: 'きって', reading: 'きって', meaning: 'postage stamp' }, { term: 'コーヒー', reading: 'こーひー', meaning: 'coffee' }, { term: 'がっこう', reading: 'がっこう', meaning: 'school' }],
    grammar: [],
    application: 'Clap the beats while saying がっこう (ga-k-ko-u: four beats) and おばあさん (o-ba-a-sa-n: five beats).',
    practice: [
      mcq('sr-p1', F, ['pron.long-vowels', 'Long vowels'], 'Which word means “high school”?', 'high school', [['こうこう', 'Both お sounds are long: こう + こう (kōkō).'], ['ここ', 'ここ has two short beats and means “here”.'], ['こうこ', 'Only the first vowel is long here; this is not the word.'], ['ここう', 'Only the second vowel is long here; this is not the word.']]),
      mcq('sr-p2', F, ['pron.double-consonants', 'Small っ (double consonants)'], 'How many beats does がっこう have?', 'がっこう', [['4', 'が・っ・こ・う — the small っ and the lengthening う each take one beat.'], ['3', 'The small っ is silent but still takes a full beat.'], ['2', 'Beats are counted per kana, not per English-style syllable.'], ['5', 'There are only four kana, and each is one beat.']]),
      typed('sr-p3', F, ['pron.double-consonants', 'Small っ (double consonants)'], 'Type the reading in romaji.', 'さっか', ['sakka'], 'The small っ doubles the next consonant: sa + (k) + ka = sakka.'),
    ],
    assessment: [
      mcq('sr-a1', F, ['pron.long-vowels', 'Long vowels'], 'Which word means “aunt”?', 'aunt', [['おばさん', 'Short あ: おばさん is “aunt”.'], ['おばあさん', 'The long あ makes this “grandmother”.'], ['おじさん', 'おじさん is “uncle”.'], ['おじいさん', 'おじいさん is “grandfather”.']]),
      typed('sr-a2', F, ['pron.double-consonants', 'Small っ (double consonants)'], 'Type the reading in romaji.', 'きって', ['kitte'], 'き + small っ + て = kitte. The っ doubles the t.'),
      mcq('sr-a3', F, ['pron.long-vowels', 'Long vowels'], 'How is a long vowel written in katakana?', 'コーヒー', [['With the bar ー', 'Katakana marks a long vowel with ー: コーヒー.'], ['By repeating the kana', 'Repeating a vowel kana is the hiragana convention.'], ['With a small ッ', 'ッ doubles a consonant; it does not lengthen a vowel.'], ['It is not written', 'Vowel length changes meaning, so it is always written.']]),
    ],
    summary: ['A long vowel is two beats; it changes the word.', 'Small っ is a silent beat that doubles the next consonant.', 'Katakana writes long vowels with ー.'],
  },

  // ───────────── N5 ─────────────
  {
    slug: 'n5-desu', level: 'n5', module: 'sentences', title: 'A は B です', jp: 'です', minutes: 12,
    objective: 'Say what something or someone is, deny it, and ask about it politely.',
    intro: 'The first Japanese sentence: a topic marked with は, then what it is, then です.',
    sections: [
      { heading: 'Stating', body: ['は (written “ha”, pronounced “wa”) marks the topic — what the sentence is about. です closes the sentence politely, roughly “is / am / are”.', 'Japanese has no articles and no plural marking here: がくせい is “a student” or “students”.'],
        examples: [{ jp: 'わたしは がくせいです。', en: 'I am a student.' }, { jp: 'これは ほんです。', en: 'This is a book.' }] },
      { heading: 'Denying and asking', body: ['The polite negative of です is じゃありません (spoken) or ではありません (more formal).', 'Add か to make a question. Word order does not change, and a question mark is not needed.'],
        examples: [{ jp: 'たなかさんは せんせいじゃありません。', en: 'Tanaka is not a teacher.' }, { jp: 'それは ほんですか。', en: 'Is that a book?' }, { jp: 'はい、そうです。／いいえ、ちがいます。', en: 'Yes, it is. / No, it is not.' }] },
    ],
    vocab: [{ term: 'わたし', reading: 'わたし', meaning: 'I, me' }, { term: 'がくせい', reading: 'がくせい', meaning: 'student' }, { term: 'せんせい', reading: 'せんせい', meaning: 'teacher' }, { term: 'かいしゃいん', reading: 'かいしゃいん', meaning: 'company employee' }, { term: 'これ', reading: 'これ', meaning: 'this (near me)' }, { term: 'それ', reading: 'それ', meaning: 'that (near you)' }, { term: 'ほん', reading: 'ほん', meaning: 'book' }],
    grammar: [{ pattern: 'A は B です', meaning: 'A is B', note: 'Polite, neutral statement.' }, { pattern: 'A は B じゃありません', meaning: 'A is not B', note: 'ではありません is the more formal form.' }, { pattern: '～ですか', meaning: 'Is it ～?', note: 'か turns a statement into a question.' }],
    application: 'Introduce yourself in two sentences: your name and what you do. わたしは ＿＿です。＿＿です。',
    practice: [
      order('n5d-p1', G5, ['n5.desu', 'A は B です'], 'I am a company employee.', ['わたし', 'は', 'かいしゃいん', 'です'], 'Topic + は, then what it is, then です at the end.'),
      mcq('n5d-p2', G5, ['n5.desu-negative', 'じゃありません'], 'Choose the polite negative.', 'これは ほん（　）。', [['じゃありません', 'Noun + じゃありません is the polite negative of です.'], ['じゃないません', 'ない and ません are both negatives; they are not combined.'], ['ですません', 'です is not conjugated by adding ません.'], ['くないです', 'くない is the negative of い-adjectives, not nouns.']]),
      mcq('n5d-p3', G5, ['n5.ka-question', 'Questions with か'], 'Make it a question.', 'たなかさんは せんせいです（　）。', [['か', 'Sentence-final か marks a question.'], ['は', 'は marks the topic and does not end a sentence.'], ['を', 'を marks a direct object.'], ['の', 'の links nouns; in polite speech it does not form this question.']]),
    ],
    assessment: [
      mcq('n5d-a1', G5, ['particle.wa-topic', 'Topic particle は'], 'Choose the particle.', 'わたし（　）がくせいです。', [['は', 'は marks わたし as the topic.'], ['を', 'を marks the object of an action verb.'], ['か', 'か comes at the end of a question.'], ['です', 'です closes the sentence; it cannot follow the topic directly.']]),
      order('n5d-a2', G5, ['n5.ka-question', 'Questions with か'], 'Is that a book?', ['それ', 'は', 'ほん', 'です', 'か'], 'Same order as the statement, with か added at the end.'),
      mcq('n5d-a3', G5, ['n5.desu-negative', 'じゃありません'], 'Answer: “No, I am not a teacher.”', 'いいえ、せんせい（　）。', [['じゃありません', 'The polite negative after a noun.'], ['です', 'です would make it “I am a teacher”.'], ['ですか', 'This asks a question instead of answering.'], ['ません', 'ません attaches to verb stems, not directly to nouns.']]),
    ],
    summary: ['は marks the topic; です ends the sentence politely.', 'Negative: じゃありません / ではありません.', 'Question: add か.'],
  },
  {
    slug: 'n5-particles', level: 'n5', module: 'particles', title: 'を・に・で・へ', jp: '助詞', minutes: 14,
    objective: 'Mark the object, the destination, the time and the place of an action.',
    intro: 'Particles come after a word and say what job that word does in the sentence. Word order is flexible; particles are not.',
    sections: [
      { heading: 'を — the thing acted on', body: ['を (pronounced “o”) marks the direct object.'], examples: [{ jp: 'みずを のみます。', en: 'I drink water.' }] },
      { heading: 'に and へ — where to, and when', body: ['に marks a destination and a specific point in time. へ (pronounced “e”) also marks direction and can replace に with movement verbs.'], examples: [{ jp: 'がっこうに いきます。', en: 'I go to school.' }, { jp: 'しちじに おきます。', en: 'I get up at seven.' }] },
      { heading: 'で — where it happens, and by what means', body: ['で marks the place where an action takes place, and the tool or means used.'], examples: [{ jp: 'うちで ごはんを たべます。', en: 'I eat at home.' }, { jp: 'バスで いきます。', en: 'I go by bus.' }] },
    ],
    vocab: [{ term: 'みず', reading: 'みず', meaning: 'water' }, { term: 'ごはん', reading: 'ごはん', meaning: 'meal; cooked rice' }, { term: 'がっこう', reading: 'がっこう', meaning: 'school' }, { term: 'うち', reading: 'うち', meaning: 'home' }, { term: 'バス', reading: 'ばす', meaning: 'bus' }, { term: 'いきます', reading: 'いきます', meaning: 'to go' }, { term: 'たべます', reading: 'たべます', meaning: 'to eat' }, { term: 'のみます', reading: 'のみます', meaning: 'to drink' }],
    grammar: [{ pattern: 'N を V', meaning: 'do V to N', note: 'Direct object.' }, { pattern: 'place に／へ いきます', meaning: 'go to a place', note: 'Destination.' }, { pattern: 'time に V', meaning: 'do V at a time', note: 'Clock times and dates; not used with きょう, あした.' }, { pattern: 'place で V', meaning: 'do V at a place', note: 'Also means: バスで “by bus”.' }],
    application: 'Describe your morning in three sentences using に (time), で (place) and を (object).',
    practice: [
      mcq('n5p-p1', G5, ['particle.wo-object', 'Object particle を'], 'Choose the particle.', 'ほん（　）よみます。', [['を', 'ほん is what is read — the direct object.'], ['に', 'に would make the book a destination or time.'], ['で', 'で would mean “by means of a book”.'], ['へ', 'へ marks direction of movement.']]),
      mcq('n5p-p2', G5, ['particle.de-place', 'Place of action で'], 'Choose the particle.', 'がっこう（　）べんきょうします。', [['で', 'Studying is an action that happens at school, so で.'], ['に', 'に marks a destination or where something exists, not where an action is done.'], ['を', 'School is not the thing being studied here.'], ['へ', 'へ needs a verb of movement.']]),
      order('n5p-p3', G5, ['particle.ni-time', 'Time に'], 'I get up at seven.', ['しちじ', 'に', 'おきます'], 'A clock time takes に, and the verb comes last.'),
    ],
    assessment: [
      mcq('n5p-a1', G5, ['particle.ni-destination', 'Destination に'], 'Choose the particle.', 'あした とうきょう（　）いきます。', [['に', 'Tokyo is the destination of いきます.'], ['で', 'で would mean the going happens inside Tokyo.'], ['を', 'いきます does not take a direct object.'], ['は', 'は would make Tokyo the topic and leave the destination unmarked.']]),
      mcq('n5p-a2', G5, ['particle.de-means', 'Means で'], 'Choose the particle.', 'バス（　）かいしゃに いきます。', [['で', 'で marks the means of transport: by bus.'], ['に', 'に is already marking the destination かいしゃ.'], ['を', 'The bus is not an object here.'], ['へ', 'へ marks a direction, not a vehicle.']]),
      order('n5p-a3', G5, ['particle.de-place', 'Place of action で'], 'I eat a meal at home.', ['うち', 'で', 'ごはん', 'を', 'たべます'], 'Place + で, object + を, verb last.'),
    ],
    summary: ['を: object. に: destination and time. へ: direction. で: place of action and means.', 'The verb comes at the end.'],
  },
  {
    slug: 'n5-masu', level: 'n5', module: 'verbs', title: 'ます: present, past, negative', jp: '動詞', minutes: 14,
    objective: 'Use the four polite verb endings and choose the right one for the time.',
    intro: 'The polite verb form ends in ます. Changing only that ending gives you negative and past.',
    sections: [
      { heading: 'Four endings', body: ['～ます: do / will do. ～ません: do not / will not. ～ました: did. ～ませんでした: did not.', 'Japanese has no separate future tense; ～ます covers habits and the future.'],
        examples: [{ jp: 'まいにち コーヒーを のみます。', en: 'I drink coffee every day.' }, { jp: 'きのう えいがを みました。', en: 'I watched a film yesterday.' }, { jp: 'けさ ごはんを たべませんでした。', en: 'I did not eat this morning.' }] },
      { heading: 'Time words', body: ['きのう (yesterday) and けさ (this morning) call for the past. あした (tomorrow) and まいにち (every day) call for ～ます / ～ません.'] },
    ],
    vocab: [{ term: 'みます', reading: 'みます', meaning: 'to see, watch' }, { term: 'します', reading: 'します', meaning: 'to do' }, { term: 'おきます', reading: 'おきます', meaning: 'to get up' }, { term: 'きのう', reading: 'きのう', meaning: 'yesterday' }, { term: 'あした', reading: 'あした', meaning: 'tomorrow' }, { term: 'まいにち', reading: 'まいにち', meaning: 'every day' }, { term: 'えいが', reading: 'えいが', meaning: 'film' }],
    grammar: [{ pattern: 'V ます／ません', meaning: 'do / do not (present, future)', note: 'Polite non-past.' }, { pattern: 'V ました／ませんでした', meaning: 'did / did not', note: 'Polite past.' }],
    application: 'Write one thing you did yesterday and one thing you will not do tomorrow.',
    practice: [
      mcq('n5m-p1', G5, ['verb.past-polite', 'Polite past ～ました'], 'Choose the form.', 'きのう テレビを（　）。', [['みました', 'きのう needs the past: みました.'], ['みます', 'みます is non-past and clashes with きのう.'], ['みません', 'This is non-past negative.'], ['みましょう', 'This means “let’s watch”.']]),
      mcq('n5m-p2', G5, ['verb.negative-polite', 'Polite negative ～ません'], 'Say you do not drink coffee.', 'コーヒーを（　）。', [['のみません', 'Replace ます with ません for the negative.'], ['のみないです', 'ない attaches to a different stem (のまない), not to the ます-stem.'], ['のみますない', 'Negatives are not made by adding ない after ます.'], ['のみじゃありません', 'じゃありません negates nouns, not verbs.']]),
      typed('n5m-p3', G5, ['verb.past-negative-polite', '～ませんでした'], 'Type the polite past negative of たべます in hiragana.', 'did not eat', ['たべませんでした'], 'ません + でした makes the past negative: たべませんでした.'),
    ],
    assessment: [
      mcq('n5m-a1', G5, ['verb.nonpast-future', '～ます for the future'], 'Choose the form.', 'あした がっこうに（　）。', [['いきます', 'The future uses the non-past ～ます.'], ['いきました', 'いきました is past and clashes with あした.'], ['いきませんでした', 'This is past negative.'], ['いきて', 'The て-form cannot end this sentence.']]),
      mcq('n5m-a2', G5, ['verb.past-negative-polite', '～ませんでした'], 'Choose the form.', 'けさ なにも（　）。', [['たべませんでした', 'なにも (“nothing”) needs a negative, and けさ needs the past.'], ['たべました', 'なにも must be followed by a negative verb.'], ['たべません', 'Negative, but non-past; けさ is already over.'], ['たべます', 'Affirmative and non-past — wrong on both counts.']]),
      order('n5m-a3', G5, ['verb.past-polite', 'Polite past ～ました'], 'I watched a film yesterday.', ['きのう', 'えいが', 'を', 'みました'], 'Time word first, object + を, past verb last.'),
    ],
    summary: ['ます / ません / ました / ませんでした.', 'Non-past covers the future.', 'Let the time word choose the tense.'],
  },
  {
    slug: 'n5-adjectives', level: 'n5', module: 'adjectives', title: 'い-adjectives and な-adjectives', jp: '形容詞', minutes: 14,
    objective: 'Describe things, and make adjectives negative and past correctly for each type.',
    intro: 'Japanese has two families of adjectives. They look alike in a dictionary but conjugate differently.',
    sections: [
      { heading: 'い-adjectives', body: ['They end in い and change that い: おいしい → おいしくない (negative) → おいしかった (past) → おいしくなかった (past negative). Add です to be polite.', 'One exception: いい (good) conjugates from よい — よくない, よかった.'],
        examples: [{ jp: 'この ラーメンは おいしいです。', en: 'This ramen is tasty.' }, { jp: 'きのうは さむかったです。', en: 'It was cold yesterday.' }] },
      { heading: 'な-adjectives', body: ['They behave like nouns: しずかです → しずかじゃありません → しずかでした. Before a noun they take な: しずかな まち.', 'きれい and ゆうめい end in い but are な-adjectives.'],
        examples: [{ jp: 'この まちは しずかです。', en: 'This town is quiet.' }, { jp: 'きれいな はなですね。', en: 'What pretty flowers.' }] },
    ],
    vocab: [{ term: 'おいしい', reading: 'おいしい', meaning: 'tasty' }, { term: 'さむい', reading: 'さむい', meaning: 'cold (weather)' }, { term: 'たかい', reading: 'たかい', meaning: 'expensive; high' }, { term: 'いい', reading: 'いい', meaning: 'good' }, { term: 'しずか', reading: 'しずか', meaning: 'quiet (な)' }, { term: 'きれい', reading: 'きれい', meaning: 'pretty; clean (な)' }, { term: 'ゆうめい', reading: 'ゆうめい', meaning: 'famous (な)' }],
    grammar: [{ pattern: 'い-adj: ～い → ～くない／～かった', meaning: 'not ～ / was ～', note: 'いい → よくない, よかった.' }, { pattern: 'な-adj: ～じゃありません／～でした', meaning: 'not ～ / was ～', note: 'な before a noun.' }],
    application: 'Describe your town with one い-adjective and one な-adjective, then say what it was like ten years ago.',
    practice: [
      mcq('n5j-p1', G5, ['adjective.i-negative', 'Negative of い-adjectives'], 'Choose the negative.', 'この ほんは（　）です。', [['たかくない', 'たかい → drop い → たかくない.'], ['たかいじゃない', 'じゃない is for nouns and な-adjectives.'], ['たかいくない', 'The い must be dropped first.'], ['たかじゃない', 'たかい is an い-adjective; it does not take じゃない.']]),
      mcq('n5j-p2', G5, ['adjective.na-before-noun', 'な before a noun'], 'Choose the form.', '（　）まちですね。', [['しずかな', 'A な-adjective takes な before a noun.'], ['しずかい', 'しずか is not an い-adjective.'], ['しずかの', 'の links two nouns; adjectives of this type use な.'], ['しずか', 'Without な it cannot directly modify the noun.']]),
      typed('n5j-p3', G5, ['adjective.ii-irregular', 'いい → よくない／よかった'], 'Type the past of いい in hiragana.', 'was good', ['よかった', 'よかったです'], 'いい conjugates from よい: よかった.'),
    ],
    assessment: [
      mcq('n5j-a1', G5, ['adjective.i-past', 'Past of い-adjectives'], 'Choose the form.', 'きのうの えいがは（　）です。', [['おもしろかった', 'Drop い, add かった.'], ['おもしろいでした', 'い-adjectives carry the past themselves; でした is not added to the plain form.'], ['おもしろくて', 'The て-form links to something else.'], ['おもしろいかった', 'The final い must be dropped.']]),
      mcq('n5j-a2', G5, ['adjective.na-negative', 'Negative of な-adjectives'], 'Choose the negative.', 'この こうえんは（　）。', [['きれいじゃありません', 'きれい is a な-adjective, so it negates like a noun.'], ['きれくないです', 'きれい is not an い-adjective despite its ending.'], ['きれいくないです', 'くない is only for い-adjectives.'], ['きれいないです', 'な is only used directly before a noun.']]),
      mcq('n5j-a3', G5, ['adjective.ii-irregular', 'いい → よくない／よかった'], 'Choose the negative of いい.', 'てんきが（　）です。', [['よくない', 'いい is irregular: よくない.'], ['いくない', 'いい changes to よ- before conjugating.'], ['いいじゃない', 'This is a casual “isn’t it good?”, not the negative form.'], ['いいくない', 'Not a possible form.']]),
    ],
    summary: ['い-adjectives change the い: くない, かった.', 'な-adjectives act like nouns and take な before a noun.', 'いい → よくない, よかった.'],
  },
  {
    slug: 'n5-arimasu', level: 'n5', module: 'sentences', title: 'あります and います', jp: '存在', minutes: 12,
    objective: 'Say that something exists or where it is.',
    intro: 'Japanese uses two verbs for “there is”: one for things, one for living beings.',
    sections: [
      { heading: 'Things and living beings', body: ['あります is for inanimate things and plants; います is for people and animals.', 'The thing that exists takes が, and the place takes に.'],
        examples: [{ jp: 'つくえの うえに ほんが あります。', en: 'There is a book on the desk.' }, { jp: 'こうえんに いぬが います。', en: 'There is a dog in the park.' }] },
      { heading: 'Position words', body: ['うえ (on, above), した (under), なか (inside), まえ (in front), うしろ (behind) follow a noun with の: かばんの なか.'], examples: [{ jp: 'ねこは いすの したに います。', en: 'The cat is under the chair.' }] },
    ],
    vocab: [{ term: 'あります', reading: 'あります', meaning: 'to exist (things)' }, { term: 'います', reading: 'います', meaning: 'to exist (people, animals)' }, { term: 'つくえ', reading: 'つくえ', meaning: 'desk' }, { term: 'いす', reading: 'いす', meaning: 'chair' }, { term: 'うえ', reading: 'うえ', meaning: 'on, above' }, { term: 'した', reading: 'した', meaning: 'under' }, { term: 'なか', reading: 'なか', meaning: 'inside' }],
    grammar: [{ pattern: 'place に N が あります／います', meaning: 'there is N at place', note: 'あります: things. います: living beings.' }, { pattern: 'N の うえ／した／なか', meaning: 'on / under / inside N', note: 'Position nouns link with の.' }],
    application: 'Look around you and write three sentences about what is on, under or inside something.',
    practice: [
      mcq('n5e-p1', G5, ['existence.imasu-arimasu', 'あります vs います'], 'Choose the verb.', 'きょうしつに がくせいが（　）。', [['います', 'Students are people, so います.'], ['あります', 'あります is for inanimate things.'], ['です', 'です states what something is, not that it exists somewhere.'], ['します', 'します means “to do”.']]),
      mcq('n5e-p2', G5, ['particle.ni-location', 'Location of existence に'], 'Choose the particle.', 'かばんの なか（　）ほんが あります。', [['に', 'The place where something exists takes に.'], ['で', 'で is for places where actions happen.'], ['を', 'There is no direct object.'], ['が', 'が is already marking ほん, the thing that exists.']]),
      order('n5e-p3', G5, ['existence.position', 'Position words with の'], 'The cat is under the chair.', ['ねこ', 'は', 'いす', 'の', 'した', 'に', 'います'], 'いすの した = under the chair; then に and います.'),
    ],
    assessment: [
      mcq('n5e-a1', G5, ['existence.imasu-arimasu', 'あります vs います'], 'Choose the verb.', 'つくえの うえに とけいが（　）。', [['あります', 'A clock is a thing, so あります.'], ['います', 'います is for people and animals.'], ['いきます', 'いきます means “to go”.'], ['ありません', 'Grammatical, but it would mean there is no clock; the sentence is affirmative.']]),
      mcq('n5e-a2', G5, ['particle.ga-existence', 'が with existence'], 'Choose the particle.', 'こうえんに いぬ（　）います。', [['が', 'The thing that exists is marked with が.'], ['を', 'います takes no direct object.'], ['に', 'に is already marking the place.'], ['で', 'で marks where an action is done.']]),
      order('n5e-a3', G5, ['particle.ni-location', 'Location of existence に'], 'There is a book on the desk.', ['つくえ', 'の', 'うえ', 'に', 'ほん', 'が', 'あります'], 'Place + に, thing + が, あります.'),
    ],
    summary: ['あります for things, います for people and animals.', 'Place に, thing が.', 'Position words attach with の.'],
  },

  // ───────────── N4 ─────────────
  {
    slug: 'n4-te-form', level: 'n4', module: 'te-form', title: 'The て-form', jp: 'て形', minutes: 18,
    objective: 'Form the て-form of any verb and use it to request, ask permission and describe ongoing actions.',
    intro: 'The て-form links a verb to whatever comes next. It is the gateway to most N4 grammar.',
    sections: [
      { heading: 'Formation', body: ['Group 2 (る-verbs): replace る with て — たべる → たべて.', 'Group 1 depends on the last kana: う・つ・る → って; む・ぶ・ぬ → んで; く → いて; ぐ → いで; す → して.', 'Irregular: する → して, くる → きて, and いく → いって.'],
        examples: [{ jp: '{買|か}う → {買|か}って　{飲|の}む → {飲|の}んで　{書|か}く → {書|か}いて', en: 'buy, drink, write' }, { jp: '{話|はな}す → {話|はな}して　{泳|およ}ぐ → {泳|およ}いで', en: 'speak, swim' }] },
      { heading: 'Three uses', body: ['～てください: please do. ～てもいいですか: may I? ～ています: is doing (or a resulting state).'],
        examples: [{ jp: 'ここに {名前|なまえ}を {書|か}いてください。', en: 'Please write your name here.' }, { jp: '{写真|しゃしん}を {撮|と}ってもいいですか。', en: 'May I take a photo?' }, { jp: '{今|いま}、{本|ほん}を {読|よ}んでいます。', en: 'I am reading a book now.' }] },
    ],
    vocab: [{ term: '{書|か}く', reading: 'かく', meaning: 'to write' }, { term: '{読|よ}む', reading: 'よむ', meaning: 'to read' }, { term: '{買|か}う', reading: 'かう', meaning: 'to buy' }, { term: '{待|ま}つ', reading: 'まつ', meaning: 'to wait' }, { term: '{泳|およ}ぐ', reading: 'およぐ', meaning: 'to swim' }, { term: '{撮|と}る', reading: 'とる', meaning: 'to take (a photo)' }, { term: '{写真|しゃしん}', reading: 'しゃしん', meaning: 'photograph' }],
    grammar: [{ pattern: 'V て + ください', meaning: 'please do V', note: 'Polite request.' }, { pattern: 'V て + もいいですか', meaning: 'may I do V?', note: 'Asking permission.' }, { pattern: 'V て + います', meaning: 'is doing V', note: 'Also a continuing state: けっこんしています.' }],
    application: 'Write a polite request and a permission question you could actually use in a shop or classroom.',
    practice: [
      typed('n4t-p1', G4, ['te-form.formation', 'て-form formation'], 'Type the て-form in hiragana.', '{飲|の}む', ['のんで', '飲んで'], 'Verbs ending in む・ぶ・ぬ take んで: のむ → のんで.'),
      mcq('n4t-p2', G4, ['te-form.formation', 'て-form formation'], 'Choose the て-form of {行|い}く.', '{行|い}く', [['いって', 'いく is the one exception among く-verbs: いって, not いいて.'], ['いいて', 'This follows the く → いて rule, but いく is irregular.'], ['いきて', 'The ます-stem + て is not the て-form for group 1.'], ['いんで', 'んで is for verbs ending in む・ぶ・ぬ.']]),
      order('n4t-p3', G4, ['te-form.kudasai', '～てください'], 'Please wait a moment.', ['ちょっと', '待って', 'ください'], 'まつ → まって (つ → って), then ください.'),
    ],
    assessment: [
      mcq('n4t-a1', G4, ['te-form.permission', 'て-form + もいいですか'], 'Choose the form.', 'ここで しゃしんを（　）も いいですか。', [['とって', 'とる (group 1, る) → とって.'], ['とりて', 'Group 1 る-verbs become って.'], ['とんで', 'とんで is the て-form of とぶ (to fly).'], ['とった', 'The plain past cannot precede もいいですか.']]),
      typed('n4t-a2', G4, ['te-form.formation', 'て-form formation'], 'Type the て-form in hiragana.', '{書|か}く', ['かいて', '書いて'], 'Verbs ending in く take いて: かく → かいて.'),
      mcq('n4t-a3', G4, ['te-form.te-iru', '～ています'], 'Choose the form.', '{今|いま}、{雨|あめ}が（　）います。', [['{降|ふ}って', 'ふる → ふって; ～ています describes what is happening now.'], ['{降|ふ}りて', 'Not the て-form of a group 1 verb.'], ['{降|ふ}る', 'The dictionary form cannot connect to います.'], ['{降|ふ}った', 'The past form cannot connect to います.']]),
    ],
    summary: ['う・つ・る → って; む・ぶ・ぬ → んで; く → いて; ぐ → いで; す → して.', 'いく → いって, する → して, くる → きて.', 'て + ください / もいいですか / います.'],
  },
  {
    slug: 'n4-potential', level: 'n4', module: 'potential', title: 'Potential form: can do', jp: '可能形', minutes: 14,
    objective: 'Say what you can and cannot do.',
    intro: 'The potential form turns “do” into “can do”. The result conjugates as a group 2 verb.',
    sections: [
      { heading: 'Formation', body: ['Group 1: change the final u-sound to the e-sound and add る — かく → かける, はなす → はなせる, よむ → よめる.', 'Group 2: replace る with られる — たべる → たべられる.', 'Irregular: する → できる, くる → こられる.'],
        examples: [{ jp: '{漢字|かんじ}が {読|よ}めます。', en: 'I can read kanji.' }, { jp: '{朝|あさ} {早|はや}く {起|お}きられません。', en: 'I cannot get up early in the morning.' }] },
      { heading: 'Particle', body: ['The object of a potential verb is usually marked with が rather than を: すしが たべられます.', 'In casual speech many speakers drop ら (たべれる). It is common, but the full form is the safe choice in writing and exams.'] },
    ],
    vocab: [{ term: '{話|はな}す', reading: 'はなす', meaning: 'to speak' }, { term: '{泳|およ}ぐ', reading: 'およぐ', meaning: 'to swim' }, { term: '{弾|ひ}く', reading: 'ひく', meaning: 'to play (a stringed or keyboard instrument)' }, { term: '{起|お}きる', reading: 'おきる', meaning: 'to get up' }, { term: 'できる', reading: 'できる', meaning: 'can do' }, { term: '{漢字|かんじ}', reading: 'かんじ', meaning: 'kanji' }],
    grammar: [{ pattern: 'Group 1: -u → -eる', meaning: 'can V', note: 'かく → かける.' }, { pattern: 'Group 2: -る → -られる', meaning: 'can V', note: 'たべる → たべられる.' }, { pattern: 'N が V-potential', meaning: 'can V N', note: 'が is preferred over を.' }],
    application: 'Write two things you can do in Japanese now, and one you cannot do yet.',
    practice: [
      typed('n4p-p1', G4, ['verb.potential', 'Potential form'], 'Type the potential form in hiragana (dictionary style).', '{話|はな}す', ['はなせる', '話せる'], 'す → せ + る: はなせる.'),
      mcq('n4p-p2', G4, ['verb.potential', 'Potential form'], 'Choose the potential form of {食|た}べる.', '{食|た}べる', [['たべられる', 'Group 2 verbs replace る with られる.'], ['たべれられる', 'Only one られ is added.'], ['たべえる', 'The -eる pattern is for group 1 verbs.'], ['たべできる', 'できる is the potential of する only.']]),
      mcq('n4p-p3', G4, ['verb.potential-particle', 'が with potential verbs'], 'Choose the particle.', 'わたしは ピアノ（　）ひけます。', [['が', 'With a potential verb, the thing you can do is normally marked with が.'], ['に', 'に does not mark what you can play.'], ['で', 'で would mean “by means of a piano”.'], ['へ', 'へ marks direction.']]),
    ],
    assessment: [
      mcq('n4p-a1', G4, ['verb.potential', 'Potential form'], 'Choose the form.', '{日本語|にほんご}が すこし（　）。', [['{話|はな}せます', 'はなす → はなせる → はなせます: “can speak”.'], ['{話|はな}します', 'This states that you speak, and would take を.'], ['{話|はな}させます', 'Causative: make someone speak.'], ['{話|はな}しません', 'Negative, and not about ability.']]),
      typed('n4p-a2', G4, ['verb.potential-irregular', 'する → できる'], 'Type the potential form of する.', 'する', ['できる'], 'する is irregular: できる.'),
      mcq('n4p-a3', G4, ['verb.potential', 'Potential form'], 'Choose the form.', 'あした {早|はや}く（　）か。', [['{来|こ}られます', 'くる → こられる: “can you come?”'], ['{来|き}られます', 'The potential of くる is read こられる, not きられる.'], ['{来|き}ます', 'This asks “will you come”, not “can you come”.'], ['{来|く}れます', 'くれる is a different verb (“to give me”).']]),
    ],
    summary: ['Group 1: -u → -eる. Group 2: る → られる.', 'する → できる, くる → こられる.', 'Mark the object with が.'],
  },
  {
    slug: 'n4-giving', level: 'n4', module: 'giving-receiving', title: 'あげる・くれる・もらう', jp: '授受', minutes: 16,
    objective: 'Choose the right verb for giving and receiving from the speaker’s point of view.',
    intro: 'Japanese has two verbs for “give”. Which one you use depends on whether the gift moves towards you or away from you.',
    sections: [
      { heading: 'Direction decides', body: ['あげる: someone gives outward — I give, or a third person gives to a third person.', 'くれる: someone gives to me, or to someone on my side (family).', 'もらう: the receiver is the subject; the giver takes に (or から).'],
        examples: [{ jp: 'わたしは {友|とも}だちに {本|ほん}を あげました。', en: 'I gave my friend a book.' }, { jp: '{友|とも}だちが わたしに {本|ほん}を くれました。', en: 'My friend gave me a book.' }, { jp: 'わたしは {友|とも}だちに {本|ほん}を もらいました。', en: 'I received a book from my friend.' }] },
      { heading: 'Favours: ～てくれる', body: ['Attached to a て-form, these verbs express doing favours. ～てくれる: someone kindly does something for me.'], examples: [{ jp: '{母|はは}が {弁当|べんとう}を {作|つく}ってくれました。', en: 'My mother (kindly) made me a packed lunch.' }] },
    ],
    vocab: [{ term: 'あげる', reading: 'あげる', meaning: 'to give (outward)' }, { term: 'くれる', reading: 'くれる', meaning: 'to give (to me)' }, { term: 'もらう', reading: 'もらう', meaning: 'to receive' }, { term: '{友|とも}だち', reading: 'ともだち', meaning: 'friend' }, { term: 'プレゼント', reading: 'ぷれぜんと', meaning: 'present' }, { term: '{母|はは}', reading: 'はは', meaning: 'my mother' }],
    grammar: [{ pattern: 'giver が me に N を くれる', meaning: 'giver gives me N', note: 'Never used when I am the giver.' }, { pattern: 'receiver は giver に N を もらう', meaning: 'receiver gets N from giver', note: 'に can be から.' }, { pattern: 'V て + くれる', meaning: 'does V for me', note: 'Carries gratitude.' }],
    application: 'Describe the last present you gave and the last one you received, using all three verbs.',
    practice: [
      mcq('n4g-p1', G4, ['giving-receiving.kureru', 'Giving and receiving: くれる'], 'Choose the verb.', '{姉|あね}が わたしに とけいを（　）。', [['くれました', 'The gift comes to me, so くれる.'], ['あげました', 'あげる cannot have わたし as the receiver.'], ['もらいました', 'With もらう the receiver (わたし) must be the subject.'], ['やりました', 'やる is giving to a junior, animal or plant.']]),
      mcq('n4g-p2', G4, ['giving-receiving.morau', 'Giving and receiving: もらう'], 'Choose the particle.', 'わたしは {先生|せんせい}（　）{辞書|じしょ}を もらいました。', [['に', 'With もらう the giver is marked with に (or から).'], ['を', 'を is already marking what was received.'], ['が', 'が would make the teacher the subject, which needs くれる.'], ['で', 'で marks place or means.']]),
      order('n4g-p3', G4, ['giving-receiving.ageru', 'Giving and receiving: あげる'], 'I gave my friend a present.', ['わたしは', '友だちに', 'プレゼントを', 'あげました'], 'I give outward → あげる; the receiver takes に.'),
    ],
    assessment: [
      mcq('n4g-a1', G4, ['giving-receiving.kureru', 'Giving and receiving: くれる'], 'Choose the verb.', '{友|とも}だちが わたしに {本|ほん}を（　）。', [['くれました', 'Friend → me: くれる.'], ['あげました', 'あげる is not used for giving to the speaker.'], ['もらいました', 'もらう needs the receiver as subject.'], ['かしました', 'かす means “to lend” — a different meaning.']]),
      mcq('n4g-a2', G4, ['giving-receiving.ageru', 'Giving and receiving: あげる'], 'Choose the verb.', 'わたしは {妹|いもうと}に おかしを（　）。', [['あげました', 'I give outward: あげる.'], ['くれました', 'くれる cannot be used when I am the giver.'], ['もらいました', 'This would mean I received sweets from my sister.'], ['いただきました', 'いただく is humble “receive”, not “give”.']]),
      mcq('n4g-a3', G4, ['giving-receiving.te-kureru', '～てくれる'], 'Choose the form.', '{友|とも}だちが {駅|えき}まで（　）。', [['{送|おく}ってくれました', '～てくれる: my friend kindly took me to the station.'], ['{送|おく}ってあげました', '～てあげる would mean the friend did it for someone else, or that I did the favour.'], ['{送|おく}ってもらいました', 'With ～てもらう the subject must be the receiver: わたしは 友だちに…'], ['{送|おく}りくれました', 'くれる attaches to the て-form.']]),
    ],
    summary: ['Outward: あげる. Towards me: くれる. Receiver as subject: もらう.', 'て-form + くれる expresses a favour received.'],
  },
  {
    slug: 'n4-conditionals', level: 'n4', module: 'conditionals', title: 'と and たら', jp: '条件', minutes: 16,
    objective: 'Express automatic results with と and one-time conditions with たら.',
    intro: 'Japanese has several ways to say “if / when”. Start with the two you will meet most.',
    sections: [
      { heading: '～と: whenever', body: ['Dictionary form + と describes a result that always follows: natural laws, machines, directions, habits.', 'The second half cannot be a request, an invitation or your own intention.'],
        examples: [{ jp: '{春|はる}に なると、{桜|さくら}が {咲|さ}きます。', en: 'When spring comes, the cherry trees bloom.' }, { jp: 'この ボタンを {押|お}すと、ドアが {開|あ}きます。', en: 'If you press this button, the door opens.' }] },
      { heading: '～たら: if / once', body: ['Past form + ら. It fits one-time conditions and “after X happens”, and the second half can be a request or intention.'],
        examples: [{ jp: '{雨|あめ}が {降|ふ}ったら、{行|い}きません。', en: 'If it rains, I will not go.' }, { jp: '{駅|えき}に {着|つ}いたら、{電話|でんわ}してください。', en: 'When you arrive at the station, please call.' }] },
    ],
    vocab: [{ term: '{押|お}す', reading: 'おす', meaning: 'to press, push' }, { term: '{開|あ}く', reading: 'あく', meaning: 'to open (by itself)' }, { term: '{着|つ}く', reading: 'つく', meaning: 'to arrive' }, { term: '{春|はる}', reading: 'はる', meaning: 'spring' }, { term: '{雨|あめ}', reading: 'あめ', meaning: 'rain' }, { term: '{電話|でんわ}', reading: 'でんわ', meaning: 'telephone' }],
    grammar: [{ pattern: 'V-dictionary + と', meaning: 'whenever V, (result)', note: 'No requests or intentions after it.' }, { pattern: 'V-た + ら', meaning: 'if / once V', note: 'Requests and intentions allowed.' }],
    application: 'Give one direction with と (“turn right and you will see…”) and one plan with たら.',
    practice: [
      mcq('n4c-p1', G4, ['conditional.to', 'Conditional ～と'], 'Choose the form.', 'この ボタンを（　）、おつりが {出|で}ます。', [['{押|お}すと', 'An automatic result: dictionary form + と.'], ['{押|お}すのに', 'のに means “even though”.'], ['{押|お}したり', 'たり lists example actions.'], ['{押|お}しながら', 'ながら needs the same subject doing two things.']]),
      mcq('n4c-p2', G4, ['conditional.tara', 'Conditional ～たら'], 'Choose the form.', '{駅|えき}に（　）、{電話|でんわ}してください。', [['{着|つ}いたら', 'A request follows, so たら is needed.'], ['{着|つ}くと', 'と cannot be followed by a request such as ～てください.'], ['{着|つ}いて', 'Possible in loose speech, but it does not express the condition “once you arrive”.'], ['{着|つ}くのに', 'のに means “even though”.']]),
      typed('n4c-p3', G4, ['conditional.tara', 'Conditional ～たら'], 'Type the たら-form in hiragana.', '{降|ふ}る', ['ふったら', '降ったら'], 'Past form ふった + ら = ふったら.'),
    ],
    assessment: [
      mcq('n4c-a1', G4, ['conditional.to', 'Conditional ～と'], 'Choose the form.', '{右|みぎ}に（　）、{銀行|ぎんこう}が あります。', [['{曲|ま}がると', 'Directions use と: turn right and (you will find) a bank.'], ['{曲|ま}がっても', 'ても means “even if”.'], ['{曲|ま}がるから', 'から gives a reason, not a condition.'], ['{曲|ま}がったり', 'たり lists actions and needs する.']]),
      mcq('n4c-a2', G4, ['conditional.tara', 'Conditional ～たら'], 'Choose the form.', '{時間|じかん}が（　）、{遊|あそ}びに {来|き}てください。', [['あったら', 'A request follows, so たら.'], ['あると', 'と cannot be followed by a request.'], ['あって', 'The て-form does not make a condition here.'], ['あるのに', 'のに means “even though”.']]),
      mcq('n4c-a3', G4, ['conditional.to-restriction', 'What cannot follow と'], 'Which sentence is natural?', 'Choose one.', [['{家|いえ}に {帰|かえ}ったら、{勉強|べんきょう}します。', 'An intention may follow たら.'], ['{家|いえ}に {帰|かえ}ると、{勉強|べんきょう}してください。', 'A request cannot follow と.'], ['{家|いえ}に {帰|かえ}ると、{勉強|べんきょう}しましょう。', 'An invitation cannot follow と.'], ['{家|いえ}に {帰|かえ}ると、{勉強|べんきょう}したいです。', 'A wish cannot follow と.']]),
    ],
    summary: ['と: automatic, repeatable results; no requests after it.', 'たら: one-time conditions and “once…”; requests are fine.'],
  },

  // ───────────── N3 ─────────────
  {
    slug: 'n3-you-koto', level: 'n3', module: 'n3-grammar', title: 'ようにする・ようになる・ことにする・ことになる', jp: '文法', minutes: 18,
    objective: 'Distinguish effort, gradual change, your own decision and decisions made for you.',
    intro: 'Four look-alike patterns built on する (I do it) and なる (it comes about). The difference is who is in control.',
    sections: [
      { heading: 'よう: effort and change', body: ['～ようにする: make an effort to do something regularly. ～ようにしている is a habit you maintain.', '～ようになる: a change over time — something has become possible or habitual. Often used with potential verbs.'],
        examples: [{ jp: '{毎日|まいにち} {野菜|やさい}を {食|た}べるようにしています。', en: 'I make a point of eating vegetables every day.' }, { jp: '{漢字|かんじ}が {読|よ}めるようになりました。', en: 'I have become able to read kanji.' }] },
      { heading: 'こと: decisions', body: ['～ことにする: I decide. ～ことにしている: a personal rule.', '～ことになる: it has been decided (by others or by circumstances). ～ことになっている: a rule or arrangement.'],
        examples: [{ jp: '{来年|らいねん}、{日本|にほん}に {留学|りゅうがく}することにしました。', en: 'I have decided to study in Japan next year.' }, { jp: '{来月|らいげつ}から {大阪|おおさか}に {転勤|てんきん}することになりました。', en: 'It has been decided that I will transfer to Osaka from next month.' }] },
    ],
    vocab: [{ term: '{野菜|やさい}', reading: 'やさい', meaning: 'vegetables' }, { term: '{健康|けんこう}', reading: 'けんこう', meaning: 'health' }, { term: '{留学|りゅうがく}', reading: 'りゅうがく', meaning: 'studying abroad' }, { term: '{転勤|てんきん}', reading: 'てんきん', meaning: 'job transfer' }, { term: '{規則|きそく}', reading: 'きそく', meaning: 'rule, regulation' }, { term: '{習慣|しゅうかん}', reading: 'しゅうかん', meaning: 'habit, custom' }],
    grammar: [{ pattern: 'V ようにする', meaning: 'try to make sure to V', note: 'Your effort.' }, { pattern: 'V ようになる', meaning: 'come to V', note: 'Gradual change.' }, { pattern: 'V ことにする', meaning: 'decide to V', note: 'Your decision.' }, { pattern: 'V ことになる', meaning: 'it is decided that V', note: 'Outside your control; also a modest way to announce news.' }],
    application: 'Write one habit you keep (ようにしている), one ability you gained this year (ようになった) and one decision made for you (ことになった).',
    practice: [
      mcq('n3y-p1', G3, ['grammar.you-ni-naru', '～ようになる'], 'Choose the expression.', '{練習|れんしゅう}して、{自転車|じてんしゃ}に {乗|の}れる（　）。', [['ようになりました', 'A new ability gained over time: potential + ようになる.'], ['ことにしました', 'Ability is not something you simply decide.'], ['ことになりました', 'This would mean someone decided it for you.'], ['ようにしました', 'ようにする is about effort, not the resulting ability.']]),
      mcq('n3y-p2', G3, ['grammar.koto-ni-suru', '～ことにする'], 'Choose the expression.', 'いろいろ {考|かんが}えて、{会社|かいしゃ}を やめる（　）。', [['ことにしました', 'After thinking it over, I decided: ことにする.'], ['ようになりました', 'This describes gradual change, not a decision.'], ['ことになっています', 'This states an existing rule.'], ['ようにしています', 'This describes an ongoing habit.']]),
      mcq('n3y-p3', G3, ['grammar.koto-ni-natteiru', '～ことになっている'], 'Choose the expression.', 'この {部屋|へや}では たばこを {吸|す}っては いけない（　）。', [['ことになっています', 'A rule or arrangement: ことになっている.'], ['ことにしました', 'This would be a personal decision, not a room rule.'], ['ようになりました', 'This describes change over time.'], ['ようにします', 'This is a promise to make an effort.']]),
    ],
    assessment: [
      mcq('n3y-a1', G3, ['grammar.you-ni-suru', '～ようにしている'], 'Choose the expression.', '{健康|けんこう}のために、{毎日|まいにち} {歩|ある}く（　）。', [['ようにしています', 'A habit kept up by effort.'], ['ことになります', 'This would mean it turns out / is decided, not a personal habit.'], ['ようになります', 'This predicts a change rather than describing your effort.'], ['ことがあります', '“Sometimes” contradicts 毎日.']]),
      mcq('n3y-a2', G3, ['grammar.koto-ni-naru', '～ことになる'], 'Choose the expression.', '{来月|らいげつ}から {大阪|おおさか}に {転勤|てんきん}する（　）。', [['ことになりました', 'A transfer is decided by the company: ことになる.'], ['ようにしました', 'A transfer is not your own effort.'], ['ようになりました', 'This describes gradual change, not a decision.'], ['ことがあります', '“Sometimes” cannot describe one future event.']]),
      mcq('n3y-a3', G3, ['grammar.you-ni-naru', '～ようになる'], 'Choose the expression.', '{日本|にほん}に {来|き}てから、{納豆|なっとう}が {食|た}べられる（　）。', [['ようになりました', 'A change that came about over time.'], ['ことにしました', 'Being able to eat it is not a decision.'], ['ことになりました', 'Nobody decided this for you.'], ['ようにしています', 'This would need a plain action (食べる), not an ability.']]),
    ],
    summary: ['する = my doing; なる = it comes about.', 'よう = effort / change; こと = decision.', 'ことになる is also a modest way to announce your own news.'],
  },
  {
    slug: 'n3-hodo-wake', level: 'n3', module: 'n3-grammar', title: '～ば～ほど・～わけではない・～とは限らない', jp: '文法', minutes: 16,
    objective: 'Express proportional change and soften or partially deny a statement.',
    intro: 'N3 texts rarely say things flatly. These three patterns let a writer scale and qualify.',
    sections: [
      { heading: '～ば～ほど', body: ['“The more…, the more…”. The verb or adjective is repeated: conditional ば form, then the plain form + ほど.'],
        examples: [{ jp: '{日本語|にほんご}は {勉強|べんきょう}すれば するほど おもしろくなる。', en: 'The more you study Japanese, the more interesting it gets.' }, { jp: '{早|はや}ければ {早|はや}いほど いい。', en: 'The sooner, the better.' }] },
      { heading: 'Partial denial', body: ['～わけではない: “it is not that…”, “it does not mean that…”. It denies what the listener might assume.', '～とは限らない: “not necessarily”. Often with かならずしも or いつも.'],
        examples: [{ jp: '{嫌|きら}いな わけではないが、あまり {食|た}べない。', en: 'It is not that I dislike it, but I do not eat it much.' }, { jp: '{高|たか}い {物|もの}が いつも いいとは {限|かぎ}らない。', en: 'Expensive things are not always good.' }] },
    ],
    vocab: [{ term: '{限|かぎ}る', reading: 'かぎる', meaning: 'to be limited to' }, { term: '{必|かなら}ずしも', reading: 'かならずしも', meaning: 'not necessarily (with a negative)' }, { term: '{嫌|きら}い', reading: 'きらい', meaning: 'disliked (な)' }, { term: '{便利|べんり}', reading: 'べんり', meaning: 'convenient (な)' }, { term: '{値段|ねだん}', reading: 'ねだん', meaning: 'price' }],
    grammar: [{ pattern: 'V-ば V ほど', meaning: 'the more V, the more…', note: 'い-adj: 早ければ早いほど.' }, { pattern: 'plain form + わけではない', meaning: 'it is not that…', note: 'Partial denial.' }, { pattern: 'plain form + とは限らない', meaning: 'not necessarily', note: 'Denies a generalisation.' }],
    application: 'Write one “the more… the more…” sentence about your own studying, and one sentence correcting a common assumption with とは限らない.',
    practice: [
      mcq('n3h-p1', G3, ['grammar.ba-hodo', '～ば～ほど'], 'Choose the word.', '{考|かんが}えれば {考|かんが}える（　）わからなくなる。', [['ほど', 'The fixed pair is ～ば～ほど.'], ['だけ', 'だけ does not complete this pattern.'], ['ばかり', 'ばかり means “only / just”.'], ['まで', 'まで means “until / as far as”.']]),
      mcq('n3h-p2', G3, ['grammar.wake-dewa-nai', '～わけではない'], 'Choose the expression.', '{料理|りょうり}が できない（　）が、{忙|いそが}しくて あまり {作|つく}らない。', [['わけではない', '“It is not that I cannot cook, but…” — partial denial.'], ['はずがない', 'はずがない means “it cannot possibly be”, which is too strong.'], ['ことはない', 'ことはない means “there is no need to”.'], ['ほかない', 'ほかない means “have no choice but to”.']]),
      order('n3h-p3', G3, ['grammar.ba-hodo', '～ば～ほど'], 'The sooner, the better.', ['早ければ', '早い', 'ほど', 'いい'], 'ば-form, then the plain form + ほど, then the result.'),
    ],
    assessment: [
      mcq('n3h-a1', G3, ['grammar.ba-hodo', '～ば～ほど'], 'Choose the word.', '{日本語|にほんご}は {勉強|べんきょう}すれば する（　）おもしろくなる。', [['ほど', '～ば～ほど: the more…, the more…'], ['くらい', 'くらい cannot replace ほど in this pattern.'], ['だけ', 'だけ does not pair with the repeated ば-form.'], ['ばかり', 'ばかり does not form this comparison.']]),
      mcq('n3h-a2', G3, ['grammar.towa-kagiranai', '～とは限らない'], 'Choose the expression.', '{日本人|にほんじん}が みんな {漢字|かんじ}に {詳|くわ}しい（　）。', [['とは{限|かぎ}らない', '“Not all Japanese people are necessarily…” — denying a generalisation.'], ['に{違|ちが}いない', 'に違いない means “must surely be”, the opposite nuance.'], ['ことになっている', 'This states a rule.'], ['ようにしている', 'This describes a habit kept by effort.']]),
      mcq('n3h-a3', G3, ['grammar.wake-dewa-nai', '～わけではない'], 'What does the speaker mean?', '{行|い}きたくない わけではない。', [['I am not saying I don’t want to go.', 'わけではない denies the assumption “you don’t want to go”.'], ['I definitely don’t want to go.', 'That would be 行きたくない, without わけではない.'], ['I cannot go.', 'Ability is not mentioned.'], ['I have decided not to go.', 'That would be 行かないことにした.']]),
    ],
    summary: ['～ば～ほど scales two things together.', 'わけではない denies an assumption without asserting the opposite.', 'とは限らない denies “always / all”.'],
  },
  {
    slug: 'n3-context-words', level: 'n3', module: 'n3-vocabulary', title: 'Words for everyday arrangements', jp: '語彙', minutes: 14,
    objective: 'Choose the right word in context for deadlines, applications and schedules.',
    intro: 'The N3 vocabulary section asks which word fits a sentence. These eight appear constantly in notices, emails and forms.',
    sections: [
      { heading: 'Arranging things', body: ['締め切り is the deadline; 申し込む is to apply or sign up; 受付 is the reception desk or the act of accepting applications.', '都合 is how your schedule or circumstances stand: 都合がいい / 悪い. 予定 is a plan or schedule. 延期 is a postponement; 中止 is a cancellation.'],
        examples: [{ jp: '{申|もう}し{込|こ}みの {締|し}め{切|き}りは {金曜日|きんようび}です。', en: 'The application deadline is Friday.' }, { jp: 'その {日|ひ}は {都合|つごう}が {悪|わる}いんです。', en: 'That day does not work for me.' }, { jp: '{雨|あめ}で {試合|しあい}が {延期|えんき}に なった。', en: 'The match was postponed because of rain.' }] },
    ],
    vocab: [{ term: '{締|し}め{切|き}り', reading: 'しめきり', meaning: 'deadline' }, { term: '{申|もう}し{込|こ}む', reading: 'もうしこむ', meaning: 'to apply, sign up' }, { term: '{受付|うけつけ}', reading: 'うけつけ', meaning: 'reception; acceptance' }, { term: '{都合|つごう}', reading: 'つごう', meaning: 'convenience, circumstances' }, { term: '{予定|よてい}', reading: 'よてい', meaning: 'plan, schedule' }, { term: '{延期|えんき}', reading: 'えんき', meaning: 'postponement' }, { term: '{中止|ちゅうし}', reading: 'ちゅうし', meaning: 'cancellation' }, { term: '{割引|わりびき}', reading: 'わりびき', meaning: 'discount' }],
    grammar: [],
    application: 'Write a two-sentence message declining an invitation because of your schedule, using 都合 and 予定.',
    practice: [
      mcq('n3w-p1', V3, ['vocab.context.tsugou', 'Contextual vocabulary: 都合'], 'Choose the word that fits.', 'すみません、{明日|あした}は（　）が {悪|わる}くて {行|い}けません。', [['{都合|つごう}', '都合が悪い: “it is not convenient for me”.'], ['{予定|よてい}', '予定 is a plan; it is not described as 悪い in this sense (予定がある would work).'], ['{割引|わりびき}', '割引 means “discount”.'], ['{受付|うけつけ}', '受付 means “reception”.']]),
      mcq('n3w-p2', V3, ['vocab.context.enki-chuushi', 'Contextual vocabulary: 延期 / 中止'], 'Choose the word that fits.', '{台風|たいふう}のため、コンサートは {来週|らいしゅう}に（　）されました。', [['{延期|えんき}', 'Moved to next week = postponed.'], ['{中止|ちゅうし}', '中止 is cancelled outright; 来週に shows it will still happen.'], ['{予定|よてい}', '予定される exists, but it does not express moving an event because of a typhoon.'], ['{締|し}め{切|き}り', '締め切り is a deadline.']]),
      mcq('n3w-p3', V3, ['vocab.context.moushikomu', 'Contextual vocabulary: 申し込む'], 'Choose the word that fits.', '{日本語|にほんご}の {試験|しけん}に（　）。', [['{申|もう}し{込|こ}みました', '試験に申し込む: to apply for an exam.'], ['{締|し}め{切|き}りました', '締め切る means to close applications — done by the organiser.'], ['{割引|わりびき}しました', '割引する means to give a discount.'], ['{延期|えんき}しました', 'You would postpone an exam, not postpone “to” it with に.']]),
    ],
    assessment: [
      mcq('n3w-a1', V3, ['vocab.context.shimekiri', 'Contextual vocabulary: 締め切り'], 'Choose the word that fits.', 'レポートの（　）は {金曜日|きんようび}です。', [['{締|し}め{切|き}り', 'The date a report is due is its 締め切り.'], ['{割引|わりびき}', '割引 means “discount”.'], ['{受付|うけつけ}', '受付 is a desk or the acceptance of applications, not a due date.'], ['{都合|つごう}', '都合 is about convenience.']]),
      mcq('n3w-a2', V3, ['vocab.context.enki-chuushi', 'Contextual vocabulary: 延期 / 中止'], 'Choose the word that fits.', '{雨|あめ}で {運動会|うんどうかい}は（　）に なり、{今年|ことし}は もう {行|おこな}われません。', [['{中止|ちゅうし}', 'It will not be held at all this year: cancelled.'], ['{延期|えんき}', '延期 implies it will be held later, which the sentence rules out.'], ['{予定|よてい}', '予定になる would mean it is scheduled.'], ['{受付|うけつけ}', '受付 means “reception”.']]),
      mcq('n3w-a3', V3, ['vocab.context.uketsuke', 'Contextual vocabulary: 受付'], 'Choose the word that fits.', '{病院|びょういん}に {着|つ}いたら、まず（　）で {名前|なまえ}を {書|か}いてください。', [['{受付|うけつけ}', 'The reception desk is where you register on arrival.'], ['{都合|つごう}', '都合 is not a place.'], ['{締|し}め{切|き}り', '締め切り is a deadline, not a place.'], ['{割引|わりびき}', '割引 means “discount”.']]),
    ],
    summary: ['締め切り deadline · 申し込む apply · 受付 reception.', '都合 convenience · 予定 plan.', '延期 postponed (still happening) vs 中止 cancelled.'],
  },
]
