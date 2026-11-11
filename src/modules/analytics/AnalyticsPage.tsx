import { useLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL, LEVELS, type Session } from '@/modules/learner/types'
import { LESSONS } from '@/content/lessons'
import { masteredCards } from '@/modules/revision/srs'
import { conceptRecords, dayKey, formatDuration, sessionSeconds, skillAccuracy, weakConcepts } from './stats'

const KIND_LABEL: Record<Session['kind'], string> = {
  placement: 'Placement', lesson: 'Lessons', revision: 'Revision', practice: 'Drills & challenges', exam: 'JLPT practice', reading: 'Reading',
  listening: 'Listening', speaking: 'Speaking', writing: 'Writing', sensei: 'Sensei', kanji: 'Kanji Lab', tech: 'Tech Lab',
}

export default function AnalyticsPage() {
  const { data } = useLearner()
  if (!data) return null
  const { sessions, attempts, cards, reviews, lessonCompletions } = data
  const total = sessions.reduce((n, s) => n + sessionSeconds(s), 0)
  const days = new Set(sessions.map((s) => dayKey(new Date(s.startedAt)))).size
  const byKind = Object.entries(sessions.reduce<Record<string, number>>((m, s) => ({ ...m, [s.kind]: (m[s.kind] ?? 0) + sessionSeconds(s) }), {})).sort((a, b) => b[1] - a[1])
  const maxKind = Math.max(1, ...byKind.map(([, v]) => v))
  const correct = attempts.filter((a) => a.isCorrect).length
  const byLevel = LEVELS.map((level) => { const rows = attempts.filter((a) => a.level === level); return { level, total: rows.length, correct: rows.filter((a) => a.isCorrect).length } }).filter((r) => r.total)
  const concepts = conceptRecords(attempts)
  const weak = weakConcepts(attempts)
  const retention = reviews.length ? reviews.filter((r) => r.rating !== 'again').length / reviews.length : null
  const uniqueDone = new Set(lessonCompletions.map((c) => c.slug)).size

  const stats: [string, string, string][] = [
    ['Total study time', formatDuration(total), `${days} day${days === 1 ? '' : 's'} active`],
    ['Answers recorded', String(attempts.length), attempts.length ? `${Math.round((correct / attempts.length) * 100)}% correct` : 'none yet'],
    ['Lessons completed', `${uniqueDone}/${LESSONS.length}`, 'of published lessons'],
    ['Revision recall', retention === null ? '—' : `${Math.round(retention * 100)}%`, `${reviews.length} review${reviews.length === 1 ? '' : 's'}`],
    ['Cards mastered', `${masteredCards(cards).length}/${cards.length}`, 'by repeated recall'],
    ['Concepts met', String(concepts.length), `${weak.length} currently weak`],
  ]

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">分析</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Analytics</h1>
      <p className="mt-2 text-sm text-soft">Everything here is computed from your recorded sessions, answers and reviews. Study time counts time inside exercises and reviews, not time spent reading lesson text.</p>

      <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3">
        {stats.map(([label, value, note]) => (
          <div key={label} className="bg-paper p-4"><dt className="label text-soft">{label}</dt><dd className="mt-2 font-display text-4xl tracking-tight">{value}</dd><dd className="label text-soft">{note}</dd></div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="border-t border-ink pt-4">
          <h2 className="label text-soft">Time by activity</h2>
          {byKind.length === 0 ? <p className="mt-3 text-soft">No sessions recorded yet.</p> : (
            <ul className="mt-3">
              {byKind.map(([kind, seconds]) => (
                <li key={kind} className="py-2">
                  <div className="flex items-baseline justify-between"><span>{KIND_LABEL[kind as Session['kind']] ?? kind}</span><span className="label text-soft">{formatDuration(seconds)}</span></div>
                  <div aria-hidden className="mt-1 h-1.5 bg-line"><div className="h-full bg-ink" style={{ width: `${(seconds / maxKind) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border-t border-ink pt-4">
          <h2 className="label text-soft">Accuracy by level and skill</h2>
          {attempts.length === 0 ? <p className="mt-3 text-soft">No answers recorded yet.</p> : (
            <ul className="mt-3">
              {[...byLevel.map((r) => [LEVEL_LABEL[r.level], r.correct, r.total] as const), ...skillAccuracy(attempts).map((r) => [r.skill[0]!.toUpperCase() + r.skill.slice(1), r.correct, r.total] as const)].map(([label, c, t]) => (
                <li key={label} className="py-2">
                  <div className="flex items-baseline justify-between"><span>{label}</span><span className="label text-soft">{c}/{t} · {Math.round((c / t) * 100)}%</span></div>
                  <div aria-hidden className="mt-1 h-1.5 bg-line"><div className="h-full bg-red" style={{ width: `${(c / t) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">Every concept you have been tested on</h2>
        {concepts.length === 0 ? <p className="mt-3 text-soft">Nothing yet.</p> : (
          <ul className="mt-2 grid gap-x-10 md:grid-cols-2">
            {[...concepts].sort((a, b) => b.incorrect / (b.correct + b.incorrect) - a.incorrect / (a.correct + a.incorrect)).map((c) => (
              <li key={c.conceptKey} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <span lang="ja" className="font-jp">{c.label}</span>
                <span className={`label whitespace-nowrap ${weak.some((w) => w.conceptKey === c.conceptKey) ? 'text-red' : 'text-soft'}`}>{c.correct}/{c.correct + c.incorrect}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
