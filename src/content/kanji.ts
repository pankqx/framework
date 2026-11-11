export interface KanjiEntry {
  char: string
  meaning: string
  on: string[]
  kun: string[]
  strokes: number
  radical: string
  compounds: [word: string, reading: string, meaning: string][]
  example: [jp: string, en: string]
}

/**
 * Starter set of beginner kanji (commonly taught first; the JLPT publishes no official kanji list).
 * Readings listed are the common ones, not exhaustive. Original example sentences.
 * Stroke-order paths are NOT included — see the Kanji Lab note about stroke data.
 */
const k = (char: string, meaning: string, on: string, kun: string, strokes: number, radical: string, compounds: KanjiEntry['compounds'], example: KanjiEntry['example']): KanjiEntry => ({
  char, meaning, on: on ? on.split('・') : [], kun: kun ? kun.split('・') : [], strokes, radical, compounds, example,
})

export const KANJI: KanjiEntry[] = [
  k('日', 'day, sun', 'ニチ・ジツ', 'ひ・か', 4, '日', [['日本', 'にほん', 'Japan'], ['毎日', 'まいにち', 'every day'], ['日曜日', 'にちようび', 'Sunday']], ['{今日|きょう}は {日曜日|にちようび}です。', 'Today is Sunday.']),
  k('月', 'moon, month', 'ゲツ・ガツ', 'つき', 4, '月', [['月曜日', 'げつようび', 'Monday'], ['一月', 'いちがつ', 'January'], ['今月', 'こんげつ', 'this month']], ['{月|つき}が きれいですね。', 'The moon is beautiful.']),
  k('火', 'fire', 'カ', 'ひ', 4, '火', [['火曜日', 'かようび', 'Tuesday'], ['火事', 'かじ', 'a fire']], ['{火曜日|かようび}に {会|あ}いましょう。', 'Let’s meet on Tuesday.']),
  k('水', 'water', 'スイ', 'みず', 4, '水', [['水曜日', 'すいようび', 'Wednesday'], ['水', 'みず', 'water']], ['{水|みず}を ください。', 'Water, please.']),
  k('木', 'tree, wood', 'モク・ボク', 'き', 4, '木', [['木曜日', 'もくようび', 'Thursday'], ['木', 'き', 'tree']], ['{公園|こうえん}に {大|おお}きい {木|き}が あります。', 'There is a big tree in the park.']),
  k('金', 'gold, money', 'キン・コン', 'かね', 8, '金', [['金曜日', 'きんようび', 'Friday'], ['お金', 'おかね', 'money']], ['お{金|かね}が ありません。', 'I have no money.']),
  k('土', 'earth, soil', 'ド・ト', 'つち', 3, '土', [['土曜日', 'どようび', 'Saturday'], ['土地', 'とち', 'land']], ['{土曜日|どようび}は {休|やす}みです。', 'Saturday is a day off.']),
  k('人', 'person', 'ジン・ニン', 'ひと', 2, '人', [['日本人', 'にほんじん', 'Japanese person'], ['三人', 'さんにん', 'three people'], ['人', 'ひと', 'person']], ['あの {人|ひと}は {先生|せんせい}です。', 'That person is a teacher.']),
  k('山', 'mountain', 'サン', 'やま', 3, '山', [['山', 'やま', 'mountain'], ['富士山', 'ふじさん', 'Mount Fuji']], ['{山|やま}に {登|のぼ}ります。', 'I climb mountains.']),
  k('川', 'river', 'セン', 'かわ', 3, '川', [['川', 'かわ', 'river']], ['{川|かわ}で {泳|およ}ぎます。', 'I swim in the river.']),
  k('大', 'big', 'ダイ・タイ', 'おお(きい)', 3, '大', [['大学', 'だいがく', 'university'], ['大きい', 'おおきい', 'big'], ['大切', 'たいせつ', 'important']], ['{大|おお}きい かばんですね。', 'That is a big bag.']),
  k('小', 'small', 'ショウ', 'ちい(さい)・こ', 3, '小', [['小さい', 'ちいさい', 'small'], ['小学校', 'しょうがっこう', 'primary school']], ['{小|ちい}さい {犬|いぬ}が います。', 'There is a small dog.']),
  k('中', 'middle, inside', 'チュウ', 'なか', 4, '丨', [['中', 'なか', 'inside'], ['中国', 'ちゅうごく', 'China']], ['かばんの {中|なか}に {本|ほん}が あります。', 'There is a book in the bag.']),
  k('上', 'above, up', 'ジョウ', 'うえ・あ(がる)', 3, '一', [['上', 'うえ', 'on, above'], ['上手', 'じょうず', 'skilful']], ['つくえの {上|うえ}に あります。', 'It is on the desk.']),
  k('下', 'below, down', 'カ・ゲ', 'した・さ(がる)', 3, '一', [['下', 'した', 'under'], ['地下鉄', 'ちかてつ', 'underground railway'], ['下手', 'へた', 'unskilful']], ['いすの {下|した}に ねこが います。', 'There is a cat under the chair.']),
  k('本', 'book, origin', 'ホン', 'もと', 5, '木', [['本', 'ほん', 'book'], ['日本', 'にほん', 'Japan']], ['この {本|ほん}は おもしろいです。', 'This book is interesting.']),
  k('学', 'study', 'ガク', 'まな(ぶ)', 8, '子', [['学生', 'がくせい', 'student'], ['学校', 'がっこう', 'school'], ['大学', 'だいがく', 'university']], ['わたしは {学生|がくせい}です。', 'I am a student.']),
  k('生', 'life, birth', 'セイ・ショウ', 'い(きる)・う(まれる)・なま', 5, '生', [['学生', 'がくせい', 'student'], ['先生', 'せんせい', 'teacher'], ['生まれる', 'うまれる', 'to be born']], ['{東京|とうきょう}で {生|う}まれました。', 'I was born in Tokyo.']),
  k('先', 'ahead, previous', 'セン', 'さき', 6, '儿', [['先生', 'せんせい', 'teacher'], ['先月', 'せんげつ', 'last month']], ['{先月|せんげつ} {日本|にほん}に {来|き}ました。', 'I came to Japan last month.']),
  k('年', 'year', 'ネン', 'とし', 6, '干', [['今年', 'ことし', 'this year'], ['来年', 'らいねん', 'next year'], ['一年', 'いちねん', 'one year']], ['{来年|らいねん} {日本|にほん}へ {行|い}きます。', 'I will go to Japan next year.']),
  k('時', 'time, hour', 'ジ', 'とき', 10, '日', [['時間', 'じかん', 'time'], ['一時', 'いちじ', 'one o’clock'], ['時々', 'ときどき', 'sometimes']], ['{時間|じかん}が ありません。', 'I have no time.']),
  k('語', 'language, word', 'ゴ', 'かた(る)', 14, '言', [['日本語', 'にほんご', 'Japanese language'], ['英語', 'えいご', 'English language']], ['{日本語|にほんご}を {勉強|べんきょう}して います。', 'I am studying Japanese.']),
  k('食', 'eat, food', 'ショク', 'た(べる)', 9, '食', [['食べる', 'たべる', 'to eat'], ['食事', 'しょくじ', 'meal']], ['{朝|あさ}ごはんを {食|た}べました。', 'I ate breakfast.']),
  k('見', 'see', 'ケン', 'み(る)', 7, '見', [['見る', 'みる', 'to see'], ['見せる', 'みせる', 'to show'], ['意見', 'いけん', 'opinion']], ['{映画|えいが}を {見|み}ます。', 'I watch films.']),
  k('行', 'go, carry out', 'コウ・ギョウ', 'い(く)・おこな(う)', 6, '行', [['行く', 'いく', 'to go'], ['銀行', 'ぎんこう', 'bank'], ['旅行', 'りょこう', 'travel']], ['{銀行|ぎんこう}に {行|い}きます。', 'I am going to the bank.']),
  k('来', 'come', 'ライ', 'く(る)', 7, '木', [['来る', 'くる', 'to come'], ['来週', 'らいしゅう', 'next week'], ['来年', 'らいねん', 'next year']], ['{来週|らいしゅう} また {来|き}ます。', 'I will come again next week.']),
  k('言', 'say, word', 'ゲン・ゴン', 'い(う)・こと', 7, '言', [['言う', 'いう', 'to say'], ['言葉', 'ことば', 'word, language']], ['もう {一度|いちど} {言|い}って ください。', 'Please say it once more.']),
  k('話', 'talk, story', 'ワ', 'はな(す)・はなし', 13, '言', [['話す', 'はなす', 'to speak'], ['電話', 'でんわ', 'telephone'], ['会話', 'かいわ', 'conversation']], ['{日本語|にほんご}で {話|はな}しましょう。', 'Let’s talk in Japanese.']),
  k('読', 'read', 'ドク', 'よ(む)', 14, '言', [['読む', 'よむ', 'to read'], ['読書', 'どくしょ', 'reading (books)']], ['{毎晩|まいばん} {本|ほん}を {読|よ}みます。', 'I read every evening.']),
  k('書', 'write', 'ショ', 'か(く)', 10, '日', [['書く', 'かく', 'to write'], ['辞書', 'じしょ', 'dictionary'], ['図書館', 'としょかん', 'library']], ['{名前|なまえ}を {書|か}いて ください。', 'Please write your name.']),
]

export const SIMILAR: { chars: [string, string, string][]; tip: string }[] = [
  { chars: [['人', 'ひと', 'person'], ['入', 'はい(る)', 'enter']], tip: 'In 人 the left stroke is the long one and the right stroke leans on it; in 入 the right stroke is the long one and starts at the top.' },
  { chars: [['土', 'つち', 'earth'], ['士', 'し', 'samurai, scholar']], tip: '土 has a long bottom line (the ground); 士 has a long top line.' },
  { chars: [['千', 'せん', 'thousand'], ['干', 'ほ(す)', 'dry']], tip: '千 begins with a stroke slanting down to the left; 干 begins with a flat horizontal line.' },
  { chars: [['大', 'おお(きい)', 'big'], ['犬', 'いぬ', 'dog'], ['太', 'ふと(い)', 'thick, fat']], tip: '犬 adds a dot at the upper right; 太 adds a dot at the bottom.' },
  { chars: [['日', 'ひ', 'day, sun'], ['目', 'め', 'eye']], tip: '日 has one line inside; 目 has two.' },
  { chars: [['木', 'き', 'tree'], ['本', 'ほん', 'book, origin']], tip: '本 is 木 with a short line across the base of the trunk — the “root”.' },
  { chars: [['未', 'み', 'not yet'], ['末', 'すえ', 'end']], tip: 'In 未 the top horizontal line is the shorter one; in 末 the top line is the longer one.' },
]
