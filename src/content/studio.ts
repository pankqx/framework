import { mcq, typed, type Exercise } from '@/modules/exercises/types'
import type { Level } from '@/modules/learner/types'

export interface Passage {
  slug: string
  level: Level
  title: string
  sentences: { jp: string; en: string }[]
  glossary: [word: string, reading: string, meaning: string][]
  questions: Exercise[]
}

const R = (level: Level) => ({ skill: 'reading' as const, level })
const text = (p: Pick<Passage, 'sentences'>) => p.sentences.map((s) => s.jp).join('')

const morning = {
  sentences: [
    { jp: 'わたしは {毎朝|まいあさ} {七時|しちじ}に {起|お}きます。', en: 'I get up at seven every morning.' },
    { jp: '{朝|あさ}ごはんは パンと コーヒーです。', en: 'Breakfast is bread and coffee.' },
    { jp: '{八時|はちじ}に {電車|でんしゃ}で {会社|かいしゃ}に {行|い}きます。', en: 'At eight I go to the office by train.' },
    { jp: '{会社|かいしゃ}は {駅|えき}の {近|ちか}くに あります。', en: 'The office is near the station.' },
    { jp: '{昼|ひる}ごはんは {会社|かいしゃ}の {食堂|しょくどう}で {食|た}べます。', en: 'I eat lunch in the company canteen.' },
    { jp: '{食堂|しょくどう}の カレーは {安|やす}くて おいしいです。', en: 'The canteen’s curry is cheap and tasty.' },
  ],
}
const kyoto = {
  sentences: [
    { jp: '{先週|せんしゅう}の {日曜日|にちようび}、{友|とも}だちと {京都|きょうと}へ {行|い}きました。', en: 'Last Sunday I went to Kyoto with a friend.' },
    { jp: '{天気|てんき}が よかったので、{駅|えき}から お{寺|てら}まで {歩|ある}いて {行|い}くことに しました。', en: 'The weather was good, so we decided to walk from the station to the temple.' },
    { jp: 'お{寺|てら}に {着|つ}くと、{人|ひと}が たくさん {並|なら}んで いました。', en: 'When we arrived at the temple, a lot of people were queuing.' },
    { jp: '{写真|しゃしん}を {撮|と}っても いいか {聞|き}いてみたら、{庭|にわ}は いいけれど {建物|たてもの}の {中|なか}は だめだと {言|い}われました。', en: 'When I asked whether I could take photos, I was told the garden was fine but inside the building was not.' },
    { jp: '{帰|かえ}りに {友|とも}だちが おいしい お{茶|ちゃ}を {買|か}って くれました。', en: 'On the way back my friend bought me some delicious tea.' },
  ],
}
const habit = {
  sentences: [
    { jp: '{最近|さいきん}、{仕事|しごと}の {後|あと}で {日本語|にほんご}の {勉強|べんきょう}を {続|つづ}けるのが {難|むずか}しく なってきた。', en: 'Recently it has become hard to keep studying Japanese after work.' },
    { jp: '{疲|つか}れて いる {日|ひ}は、{教科書|きょうかしょ}を {開|ひら}く {気|き}に なれない。', en: 'On days when I am tired, I cannot bring myself to open the textbook.' },
    { jp: 'そこで、{毎日|まいにち} {長|なが}い {時間|じかん} {勉強|べんきょう}する {代|か}わりに、{電車|でんしゃ}の {中|なか}で {十分|じゅっぷん}だけ {単語|たんご}を {復習|ふくしゅう}する ように した。', en: 'So instead of studying for a long time every day, I started reviewing vocabulary for just ten minutes on the train.' },
    { jp: '{短|みじか}い {時間|じかん}でも、{続|つづ}ければ {続|つづ}けるほど {覚|おぼ}えた {言葉|ことば}が {増|ふ}えて いく。', en: 'Even in a short time, the longer I keep it up, the more words I remember.' },
    { jp: '{大切|たいせつ}なのは {量|りょう}では なく、{毎日|まいにち} やめない ことだと {思|おも}う ように なった。', en: 'I have come to think that what matters is not the amount, but not giving up each day.' },
  ],
}

export const PASSAGES: Passage[] = [
  {
    slug: 'my-morning', level: 'n5', title: 'わたしの あさ', ...morning,
    glossary: [['毎朝', 'まいあさ', 'every morning'], ['電車', 'でんしゃ', 'train'], ['会社', 'かいしゃ', 'company, office'], ['近く', 'ちかく', 'near'], ['食堂', 'しょくどう', 'canteen'], ['安い', 'やすい', 'cheap']],
    questions: [
      mcq('rd-morning-1', { ...R('n5'), passage: text(morning) }, ['reading.detail', 'Reading: finding a detail'], 'Answer from the passage.', 'この {人|ひと}は {何時|なんじ}に {起|お}きますか。', [['{七時|しちじ}', 'The first sentence says 七時に起きます.'], ['{八時|はちじ}', '八時 is when the writer leaves for the office.'], ['{六時|ろくじ}', '六時 is not mentioned.'], ['{九時|くじ}', '九時 is not mentioned.']]),
      mcq('rd-morning-2', { ...R('n5'), passage: text(morning) }, ['reading.detail', 'Reading: finding a detail'], 'Answer from the passage.', 'どうやって {会社|かいしゃ}に {行|い}きますか。', [['{電車|でんしゃ}で', '電車で会社に行きます — で marks the means.'], ['バスで', 'A bus is not mentioned.'], ['{歩|ある}いて', 'Walking is not mentioned.'], ['{車|くるま}で', 'A car is not mentioned.']]),
      mcq('rd-morning-3', { ...R('n5'), passage: text(morning) }, ['reading.te-linking', 'Reading: adjectives joined with て'], 'Answer from the passage.', '{食堂|しょくどう}の カレーは どうですか。', [['{安|やす}くて おいしい', '安くておいしいです: cheap and tasty.'], ['{高|たか}くて おいしい', 'The passage says 安い (cheap), not 高い.'], ['{安|やす}いが おいしくない', 'The passage says it is tasty.'], ['{高|たか}くて おいしくない', 'Both parts contradict the passage.']]),
    ],
  },
  {
    slug: 'kyoto-day', level: 'n4', title: '{京都|きょうと}の {一日|いちにち}', ...kyoto,
    glossary: [['天気', 'てんき', 'weather'], ['お寺', 'おてら', 'temple'], ['並ぶ', 'ならぶ', 'to queue, line up'], ['庭', 'にわ', 'garden'], ['建物', 'たてもの', 'building'], ['帰り', 'かえり', 'the way back']],
    questions: [
      mcq('rd-kyoto-1', { ...R('n4'), passage: text(kyoto) }, ['reading.reason', 'Reading: finding the reason'], 'Answer from the passage.', 'どうして お{寺|てら}まで {歩|ある}きましたか。', [['{天気|てんき}が よかったから', '天気がよかったので — ので gives the reason.'], ['{電車|でんしゃ}が なかったから', 'Trains are not mentioned.'], ['お{寺|てら}が {近|ちか}かったから', 'The distance is not mentioned.'], ['{友|とも}だちが {歩|ある}きたいと {言|い}ったから', 'The friend’s wish is not mentioned.']]),
      mcq('rd-kyoto-2', { ...R('n4'), passage: text(kyoto) }, ['reading.detail', 'Reading: finding a detail'], 'Answer from the passage.', '{写真|しゃしん}を {撮|と}っても いい {所|ところ}は どこですか。', [['{庭|にわ}', '庭はいいけれど — the garden is allowed.'], ['{建物|たてもの}の {中|なか}', '建物の中はだめ — not allowed.'], ['どこでも いい', 'One place was refused.'], ['どこも だめ', 'The garden was allowed.']]),
      mcq('rd-kyoto-3', { ...R('n4'), passage: text(kyoto) }, ['giving-receiving.te-kureru', '～てくれる'], 'Answer from the passage.', 'お{茶|ちゃ}を {買|か}ったのは だれですか。', [['{友|とも}だち', '友だちが…買ってくれました: the friend bought it for the writer.'], ['わたし', '～てくれる shows someone else did it for the writer.'], ['お{寺|てら}の {人|ひと}', 'Temple staff only answered the question about photos.'], ['{二人|ふたり}で {買|か}った', 'The subject is 友だち alone.']]),
    ],
  },
  {
    slug: 'ten-minutes', level: 'n3', title: '{十分|じゅっぷん}の {習慣|しゅうかん}', ...habit,
    glossary: [['続ける', 'つづける', 'to continue'], ['疲れる', 'つかれる', 'to get tired'], ['代わりに', 'かわりに', 'instead of'], ['単語', 'たんご', 'vocabulary word'], ['復習', 'ふくしゅう', 'review'], ['増える', 'ふえる', 'to increase'], ['量', 'りょう', 'amount']],
    questions: [
      mcq('rd-habit-1', { ...R('n3'), passage: text(habit) }, ['reading.reason', 'Reading: finding the reason'], 'Answer from the passage.', '{勉強|べんきょう}を {続|つづ}けるのが {難|むずか}しく なったのは なぜですか。', [['{仕事|しごと}の {後|あと}で {疲|つか}れて いるから', 'The writer cannot open the textbook on tired days after work.'], ['{教科書|きょうかしょ}が {難|むずか}しすぎるから', 'The textbook’s difficulty is not mentioned.'], ['{電車|でんしゃ}の {時間|じかん}が {長|なが}いから', 'The train is where the writer now studies, not the problem.'], ['{日本語|にほんご}が {嫌|きら}いに なったから', 'The writer keeps studying; dislike is not mentioned.']]),
      mcq('rd-habit-2', { ...R('n3'), passage: text(habit) }, ['grammar.you-ni-suru', '～ようにしている'], 'Answer from the passage.', 'この {人|ひと}は {何|なに}を する ように しましたか。', [['{電車|でんしゃ}で {十分|じゅっぷん}だけ {単語|たんご}を {復習|ふくしゅう}する', 'This is what follows ようにした in the passage.'], ['{毎日|まいにち} {長|なが}い {時間|じかん} {勉強|べんきょう}する', 'This is what the writer stopped doing (代わりに).'], ['{仕事|しごと}の {後|あと}で {教科書|きょうかしょ}を {読|よ}む', 'This is what became hard.'], ['{週末|しゅうまつ}に まとめて {勉強|べんきょう}する', 'Weekends are not mentioned.']]),
      mcq('rd-habit-3', { ...R('n3'), passage: text(habit) }, ['reading.main-idea', 'Reading: the writer’s main point'], 'Which matches the writer’s view?', 'この {文章|ぶんしょう}で いちばん {言|い}いたい ことは {何|なん}ですか。', [['{少|すこ}しでも {毎日|まいにち} {続|つづ}ける ことが {大切|たいせつ}だ', 'The final sentence: what matters is not the amount but not stopping.'], ['{勉強|べんきょう}は {量|りょう}が いちばん {大切|たいせつ}だ', 'The writer says the opposite: 量ではなく.'], ['{疲|つか}れた {日|ひ}は {休|やす}んだ ほうが いい', 'The writer found a way to continue, not to rest.'], ['{電車|でんしゃ}の {中|なか}では {勉強|べんきょう}できない', 'The writer studies on the train.']]),
    ],
  },
]

const L = (level: Level) => ({ skill: 'listening' as const, level })
export const LISTENING: Exercise[] = [
  mcq('ls-1', { ...L('n5'), audio: 'すみません、コーヒーを ふたつ ください。' }, ['listening.numbers', 'Listening: counters'], 'Listen. How many coffees?', 'コーヒーは いくつ？', [['ふたつ (2)', 'ふたつ is the general counter for two things.'], ['ひとつ (1)', 'ひとつ is one.'], ['みっつ (3)', 'みっつ is three.'], ['よっつ (4)', 'よっつ is four.']]),
  mcq('ls-2', { ...L('n5'), audio: 'あしたの テストは くじはんからです。' }, ['listening.time', 'Listening: clock times'], 'Listen. When does the test start?', 'テストは なんじから？', [['9:30', 'くじはん = nine thirty (はん = half).'], ['9:00', 'はん adds thirty minutes.'], ['7:30', 'しちじ would be seven; this is くじ.'], ['6:30', 'ろくじ would be six; this is くじ.']]),
  mcq('ls-3', { ...L('n5'), audio: 'ゆうびんきょくは あの しんごうを みぎに まがって、すぐです。' }, ['listening.directions', 'Listening: directions'], 'Listen. Which way at the traffic light?', 'しんごうを どちらに？', [['Right', 'みぎに まがって: turn right.'], ['Left', 'Left would be ひだり.'], ['Straight on', 'Straight would be まっすぐ.'], ['Go back', 'Going back would be もどって.']]),
  mcq('ls-4', { ...L('n4'), audio: 'きのうは あめが ふっていたので、でかけないで うちで えいがを みました。' }, ['listening.reason', 'Listening: reason and result'], 'Listen. What did the speaker do yesterday?', 'きのう なにを しましたか。', [['Watched a film at home', 'でかけないで うちで えいがを みました.'], ['Went out to the cinema', 'でかけないで means “without going out”.'], ['Walked in the rain', 'The rain is why the speaker stayed in.'], ['Studied at home', 'Studying is not mentioned.']]),
  mcq('ls-5', { ...L('n4'), audio: 'この へやでは しゃしんを とっても いいですが、たべものは たべないで ください。' }, ['listening.permission', 'Listening: permission and prohibition'], 'Listen. What is not allowed in this room?', 'だめな ことは？', [['Eating', 'たべないで ください: please do not eat.'], ['Taking photos', 'とっても いいです: photos are allowed.'], ['Talking', 'Talking is not mentioned.'], ['Both photos and eating', 'Only eating is prohibited.']]),
  mcq('ls-6', { ...L('n4'), audio: 'かいぎは さんじからの よていでしたが、ぶちょうの つごうで よじに かわりました。' }, ['listening.change', 'Listening: a changed arrangement'], 'Listen. When is the meeting now?', 'かいぎは なんじ？', [['4:00', 'よじに かわりました: it changed to four.'], ['3:00', 'Three was the original plan.'], ['3:30', 'Not mentioned.'], ['It is cancelled', 'It was moved, not cancelled.']]),
  mcq('ls-7', { ...L('n3'), audio: 'もうしわけありませんが、たんとうの ものは ただいま せきを はずして おります。もどりましたら、こちらから おでんわ するように つたえます。' }, ['listening.keigo-phone', 'Listening: business phone language'], 'Listen. What will happen next?', 'このあと どう なりますか。', [['The person in charge will call back', 'こちらから お電話するように伝えます: “I will tell them to call you.”'], ['The caller should call again later', 'The speaker offers a call back from their side (こちらから).'], ['The person in charge will answer now', '席を外しております: they are away from their desk.'], ['The speaker will handle the request personally', 'The speaker only passes on the message.']]),
  mcq('ls-8', { ...L('n3'), audio: 'さいきん うんどうぶそくだから、エレベーターを つかわないで、できるだけ かいだんを つかうように しているんです。' }, ['grammar.you-ni-suru', '～ようにしている'], 'Listen. What is the speaker doing these days?', 'さいきん なにを していますか。', [['Trying to take the stairs', '階段を使うようにしている: making an effort to use the stairs.'], ['Going to the gym every day', 'A gym is not mentioned.'], ['Using the lift more', 'エレベーターを使わないで: without using the lift.'], ['Stopped exercising', 'The speaker is trying to move more, because of 運動不足.']]),
]

export const SPEAKING_PHRASES: { level: Level; jp: string; kana: string; en: string }[] = [
  { level: 'n5', jp: 'おはようございます', kana: 'おはようございます', en: 'Good morning.' },
  { level: 'n5', jp: 'よろしくお願いします', kana: 'よろしくおねがいします', en: 'Pleased to meet you / I am in your care.' },
  { level: 'n5', jp: 'これはいくらですか', kana: 'これはいくらですか', en: 'How much is this?' },
  { level: 'n5', jp: '駅はどこですか', kana: 'えきはどこですか', en: 'Where is the station?' },
  { level: 'n4', jp: '写真を撮ってもいいですか', kana: 'しゃしんをとってもいいですか', en: 'May I take a photo?' },
  { level: 'n4', jp: 'もう一度言ってください', kana: 'もういちどいってください', en: 'Please say it once more.' },
  { level: 'n3', jp: '申し訳ありませんが、明日は都合が悪いんです', kana: 'もうしわけありませんがあしたはつごうがわるいんです', en: 'I am very sorry, but tomorrow does not work for me.' },
]

const W = (level: Level) => ({ skill: 'writing' as const, level })
export const TYPING_DRILLS: Exercise[] = [
  typed('wr-1', W('n5'), ['writing.typing.desu', 'Typing: A は B です'], 'Type in hiragana (use a Japanese keyboard/IME).', 'I am a student.', ['わたしはがくせいです', '私は学生です', 'わたしは学生です'], 'わたしは がくせいです。 With romaji input, は is typed “ha”.'),
  typed('wr-2', W('n5'), ['writing.typing.particles', 'Typing: を and に'], 'Type in hiragana.', 'I drink water.', ['みずをのみます', '水を飲みます', '水をのみます'], 'みずを のみます。 を is typed “wo”.'),
  typed('wr-3', W('n5'), ['writing.typing.small-tsu', 'Typing: small っ'], 'Type in hiragana.', 'school', ['がっこう', '学校'], 'がっこう. Type a doubled consonant (“gakkou”) to get the small っ.'),
  typed('wr-4', W('n5'), ['writing.typing.past', 'Typing: past tense'], 'Type in hiragana.', 'I watched a film yesterday.', ['きのうえいがをみました', '昨日映画を見ました', 'きのう映画を見ました', '昨日えいがをみました'], 'きのう えいがを みました。'),
  typed('wr-5', W('n4'), ['writing.typing.te-kudasai', 'Typing: ～てください'], 'Type in Japanese.', 'Please wait a moment.', ['ちょっとまってください', 'ちょっと待ってください', '少々お待ちください', 'しょうしょうおまちください'], 'ちょっと まって ください。 (More formal: 少々お待ちください.)'),
  typed('wr-6', W('n4'), ['writing.typing.permission', 'Typing: ～てもいいですか'], 'Type in Japanese.', 'May I sit here?', ['ここにすわってもいいですか', 'ここに座ってもいいですか'], 'ここに すわっても いいですか。'),
]

export const DIARY_PROMPTS = ['きょう なにを しましたか。', '{週末|しゅうまつ}の {予定|よてい}は {何|なん}ですか。', '{最近|さいきん} うれしかった ことを {書|か}いて ください。', '{日本語|にほんご}を {勉強|べんきょう}する {理由|りゆう}は {何|なん}ですか。']
