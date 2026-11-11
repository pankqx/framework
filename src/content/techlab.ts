import { mcq, order, typed, type Exercise } from '@/modules/exercises/types'

export const TECH_VOCAB: { group: string; items: [term: string, reading: string, meaning: string][] }[] = [
  { group: 'Code', items: [['変数', 'へんすう', 'variable'], ['関数', 'かんすう', 'function'], ['配列', 'はいれつ', 'array'], ['引数', 'ひきすう', 'argument'], ['戻り値', 'もどりち', 'return value'], ['例外', 'れいがい', 'exception'], ['非同期', 'ひどうき', 'asynchronous'], ['実行', 'じっこう', 'execution, run']] },
  { group: 'Operations', items: [['取得', 'しゅとく', 'get, fetch'], ['追加', 'ついか', 'add'], ['更新', 'こうしん', 'update'], ['削除', 'さくじょ', 'delete'], ['検索', 'けんさく', 'search'], ['保存', 'ほぞん', 'save'], ['設定', 'せってい', 'settings, configure']] },
  { group: 'Architecture & database', items: [['設計', 'せっけい', 'design'], ['接続', 'せつぞく', 'connection'], ['認証', 'にんしょう', 'authentication'], ['依存関係', 'いぞんかんけい', 'dependency'], ['環境変数', 'かんきょうへんすう', 'environment variable'], ['主キー', 'しゅキー', 'primary key']] },
  { group: 'Algorithms & interviews', items: [['計算量', 'けいさんりょう', 'computational complexity'], ['再帰', 'さいき', 'recursion'], ['二分探索', 'にぶんたんさく', 'binary search']] },
]

const T = { skill: 'reading' as const, level: 'n3' as const }

/** Code stays in its real language; only comments, docs and messages are Japanese. */
export const TECH_EXERCISES: Exercise[] = [
  { ...mcq('tl-1', T, ['tech.comments', 'Tech: reading code comments'], 'What does the comment say this code does?', '// 配列が空の場合は null を返す', [['Returns null if the array is empty', '配列 (array) が 空 (empty) の 場合 (case) は null を 返す (return).'], ['Returns an empty array if the value is null', 'The condition and the result are reversed.'], ['Throws an exception if the array is empty', '例外 (exception) is not mentioned; it says 返す (return).'], ['Deletes null values from the array', '削除 (delete) is not mentioned.']]), code: 'if (items.length === 0) return null' },
  mcq('tl-2', T, ['tech.api-docs', 'Tech: reading API documentation'], 'What does this line of API documentation mean?', 'このエンドポイントは認証が必要です。', [['This endpoint requires authentication', '認証 (authentication) が 必要 (necessary).'], ['This endpoint is deprecated', 'Deprecated would be 非推奨.'], ['This endpoint returns an error', 'エラーを返す is not what it says.'], ['This endpoint needs no settings', '設定 is not mentioned.']]),
  mcq('tl-3', T, ['tech.errors', 'Tech: reading error messages'], 'What is this error telling you?', 'ファイルが見つかりません。', [['The file was not found', '見つかりません: cannot be found.'], ['The file is too large', 'Too large would be 大きすぎます.'], ['The file was saved', 'Saved would be 保存されました.'], ['The file was deleted', 'Deleted would be 削除されました.']]),
  mcq('tl-4', T, ['tech.instructions', 'Tech: following setup instructions'], 'What must you do first?', '環境変数 API_KEY を設定してから、サーバーを再起動してください。', [['Set the API_KEY environment variable', '～てから: do this first, then restart (再起動) the server.'], ['Restart the server', 'Restarting comes after setting the variable.'], ['Delete the API_KEY', '設定 is “set”, not “delete”.'], ['Connect to the database', 'A database is not mentioned.']]),
  mcq('tl-5', T, ['tech.interview', 'Tech: interview questions'], 'What is the interviewer asking for?', 'この関数の計算量を説明してください。', [['Explain this function’s computational complexity', '計算量 is computational complexity; 説明 is “explain”.'], ['Explain what this function returns', 'Return value would be 戻り値.'], ['Rewrite this function recursively', 'Recursion would be 再帰.'], ['Count the lines in this function', '計算量 is not line count.']]),
  { ...mcq('tl-6', T, ['tech.writing-comments', 'Tech: writing code comments'], 'Which Japanese comment describes this code?', 'Choose the accurate comment.', [['// 有効なユーザーだけを抽出する', 'filter keeps only matching items: “extract only active users”.'], ['// すべてのユーザーを削除する', 'Nothing is deleted.'], ['// ユーザーを名前で並べ替える', '並べ替える is “sort”; this code filters.'], ['// 新しいユーザーを追加する', 'Nothing is added.']]), code: 'const activeUsers = users.filter((u) => u.active)' },
  order('tl-7', T, ['tech.explaining', 'Tech: explaining code in Japanese'], 'This function returns an array.', ['この関数は', '配列を', '返します'], 'Topic は, object を, verb last — the same order as everyday Japanese.'),
  typed('tl-8', { skill: 'vocabulary', level: 'n3' }, ['tech.vocab.hensuu', 'Tech vocabulary: 変数'], 'Type the reading in hiragana.', '変数', ['へんすう'], '変数 (へんすう) means “variable”.'),
]

export const TECH_RESPONSES: { instruction: string; en: string; model: string }[] = [
  { instruction: 'この関数が何をするか、日本語で一文で説明してください。', en: 'Explain in one Japanese sentence what the function does: `function sum(a, b) { return a + b }`', model: 'この関数は、二つの引数を足した値を返します。' },
  { instruction: 'バグを見つけました。チームに日本語で短く報告してください。', en: 'You found a bug: the login page shows an error when the password is empty. Report it briefly in Japanese.', model: 'ログインページで、パスワードが空の場合にエラーが表示されます。確認をお願いします。' },
]
