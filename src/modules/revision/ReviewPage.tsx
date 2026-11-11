import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { newId } from '@/lib/id'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import type { Card, Rating } from '@/modules/learner/types'
import { DEFAULT_SRS, dueCards, formatInterval, isMastered, newCard, schedule, upcomingCards } from './srs'

const RATINGS: [Rating, string, string][] = [['again', 'Again', 'Forgot'], ['hard', 'Hard', 'Barely'], ['good', 'Good', 'Recalled'], ['easy', 'Easy', 'Instant']]

export default function ReviewPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const sessionId = useRef(newId())
  const startedAt = useRef(new Date().toISOString())
  const cards = data?.cards ?? []
  const now = new Date()
  const due = useMemo(() => dueCards(cards, new Date()), [cards])
  const card = due[0]

  const rate = (c: Card, rating: Rating) => {
    update.mutate((state) => {
      const at = new Date()
      const i = state.cards.findIndex((x) => x.id === c.id)
      if (i < 0) return
      const next = schedule(state.cards[i]!, rating, at)
      state.reviews.push({ id: newId(), cardId: c.id, rating, intervalBefore: state.cards[i]!.intervalDays, intervalAfter: next.intervalDays, reviewedAt: at.toISOString() })
      state.cards[i] = next
      const s = state.sessions.find((x) => x.id === sessionId.current)
      if (s) s.endedAt = at.toISOString()
      else state.sessions.push({ id: sessionId.current, kind: 'revision', startedAt: startedAt.current, endedAt: at.toISOString() })
    })
    setRevealed(false)
    setReviewed(reviewed + 1)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <header className="flex items-end justify-between gap-4 pb-8">
        <div>
          <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">復習</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">Revision</h1>
        </div>
        <dl className="grid grid-cols-3 gap-px border border-line bg-line text-center">
          {[['Due', due.length], ['Next 7 days', upcomingCards(cards, now).length], ['Mastered', cards.filter((c) => isMastered(c)).length]].map(([l, v]) => (
            <div key={l} className="bg-paper px-3 py-2"><dt className="label text-soft">{l}</dt><dd className="font-display text-3xl">{v}</dd></div>
          ))}
        </dl>
      </header>

      {card ? (
        <section className="fade-up border-t border-ink pt-4" key={card.id + card.dueAt}>
          <p className="label text-soft">{card.kind} · {card.repetitions === 0 ? (card.lapses ? 'relearning' : 'new') : `interval ${formatInterval(card.intervalDays)}`}</p>
          <p lang="ja" className="mt-8 font-jp-serif text-5xl leading-tight font-black break-words md:text-6xl">{card.front}</p>
          {!revealed ? (
            <button type="button" autoFocus className="btn btn-solid mt-10" onClick={() => setRevealed(true)}>Show answer</button>
          ) : (
            <div className="fade-up mt-8">
              {card.reading && <p lang="ja" className="font-jp text-2xl text-soft">{card.reading}</p>}
              <p className="mt-2 border-l-4 border-red bg-muted p-5 text-xl leading-relaxed">{card.back}</p>
              <p className="label mt-8 text-soft">How well did you recall it?</p>
              <div className="mt-3 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
                {RATINGS.map(([rating, label, hint]) => (
                  <button key={rating} type="button" onClick={() => rate(card, rating)} className={`min-h-20 bg-paper px-3 py-3 text-left hover:bg-ink hover:text-paper ${rating === 'again' ? 'text-red' : ''}`}>
                    <span className="block font-display text-xl">{label}</span>
                    <span className="label block opacity-70">{hint} · {formatInterval(schedule(card, rating, now).intervalDays)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="border-t border-ink pt-6">
          <h2 className="font-display text-3xl tracking-tight">{cards.length === 0 ? 'No cards yet' : reviewed > 0 ? `Done — ${reviewed} reviewed` : 'Nothing due right now'}</h2>
          <p className="mt-3 leading-relaxed text-soft">
            {cards.length === 0 ? 'Completing a lesson adds its vocabulary and grammar here. You can also add your own cards below.' : 'Cards return when their interval has passed. Coming back on time is what moves them towards mastery.'}
          </p>
          <Link to="/app/curriculum" className="btn mt-5">Go to lessons <span aria-hidden>→</span></Link>
        </section>
      )}

      <CustomCardForm />

      <section className="mt-12 border-t border-ink pt-4">
        <h2 className="label text-soft">How scheduling works</h2>
        <p className="mt-3 text-sm leading-relaxed text-soft">
          Again resets a card to {DEFAULT_SRS.againMinutes} minutes. A new card goes to {formatInterval(DEFAULT_SRS.firstHardDays)} (Hard), {formatInterval(DEFAULT_SRS.firstGoodDays)} (Good) or {formatInterval(DEFAULT_SRS.firstEasyDays)} (Easy); after that each successful recall multiplies the interval by the card’s ease. A card counts as mastered after {DEFAULT_SRS.masteryRepetitions} successful recalls in a row with an interval of at least {DEFAULT_SRS.masteryIntervalDays} days. These values live in one config object (`DEFAULT_SRS`).
        </p>
      </section>

      {cards.length > 0 && (
        <section className="mt-12 border-t border-ink pt-4">
          <h2 className="label text-soft">All cards ({cards.length})</h2>
          <ul className="mt-3">
            {[...cards].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).map((c) => (
              <li key={c.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-line py-2.5">
                <span><span lang="ja" className="font-jp font-bold">{c.front}</span> <span className="text-sm text-soft">{c.back}</span></span>
                <span className="label text-soft">{isMastered(c) ? 'mastered' : Date.parse(c.dueAt) <= now.getTime() ? 'due' : `in ${formatInterval((Date.parse(c.dueAt) - now.getTime()) / 86_400_000)}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function CustomCardForm() {
  const update = useUpdateLearner()
  const [front, setFront] = useState('')
  const [reading, setReading] = useState('')
  const [back, setBack] = useState('')
  const valid = front.trim() && back.trim()
  const field = 'mt-1 w-full border-b border-ink bg-transparent py-2 text-lg outline-none focus:border-red'
  return (
    <form
      className="mt-12 border-t border-ink pt-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        update.mutate((state) => void state.cards.push(newCard('custom', `custom:${newId()}`, front.trim(), back.trim(), new Date(), reading.trim() || undefined)))
        setFront(''); setReading(''); setBack('')
      }}
    >
      <h2 className="label text-soft">Add your own card</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="label text-soft">Japanese<input lang="ja" className={`${field} font-jp`} value={front} onChange={(e) => setFront(e.target.value)} maxLength={80} /></label>
        <label className="label text-soft">Reading (optional)<input lang="ja" className={`${field} font-jp`} value={reading} onChange={(e) => setReading(e.target.value)} maxLength={80} /></label>
        <label className="label text-soft">Meaning<input className={field} value={back} onChange={(e) => setBack(e.target.value)} maxLength={160} /></label>
      </div>
      <button type="submit" className="btn mt-5" disabled={!valid}>Add card</button>
    </form>
  )
}
