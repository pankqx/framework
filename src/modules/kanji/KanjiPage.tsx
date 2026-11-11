import { useEffect, useMemo, useRef, useState } from 'react'
import { JP } from '@/components/JP'
import { KANJI, SIMILAR, type KanjiEntry } from '@/content/kanji'
import { ExerciseRunner, type RunSummary } from '@/modules/exercises/ExerciseRunner'
import { shuffled } from '@/modules/exercises/evaluate'
import { mcq, type Exercise } from '@/modules/exercises/types'
import { useLearner, useUpdateLearner } from '@/modules/learner/hooks'
import { newCard } from '@/modules/revision/srs'

/** Reading-in-context questions generated from the compound list. */
export function kanjiQuiz(entries: KanjiEntry[], seed: string): Exercise[] {
  const all = KANJI.flatMap((e) => e.compounds.map((c) => ({ e, c })))
  return shuffled(entries.flatMap((e) => e.compounds.slice(0, 1).map((c) => ({ e, c }))), seed).map(({ e, c }) => {
    const wrong = shuffled(all.filter((x) => x.c[1] !== c[1]), `${seed}-${c[0]}`).filter((x, i, a) => a.findIndex((y) => y.c[1] === x.c[1]) === i).slice(0, 3)
    return mcq(`kanji-read-${c[0]}`, { skill: 'kanji', level: 'n5' }, [`kanji.${e.char}`, `${e.char} — ${e.meaning}`], 'How is this word read?', c[0], [
      [c[1], `${c[0]} is read ${c[1]} (“${c[2]}”).`],
      ...wrong.map((w): [string, string] => [w.c[1], `${w.c[1]} is the reading of ${w.c[0]} (“${w.c[2]}”).`]),
    ])
  })
}

export default function KanjiPage() {
  const { data } = useLearner()
  const update = useUpdateLearner()
  const [selected, setSelected] = useState<KanjiEntry>(KANJI[0]!)
  const [quiz, setQuiz] = useState<Exercise[] | null>(null)
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const hasCard = (data?.cards ?? []).some((c) => c.conceptKey === `kanji:${selected.char}`)
  const similar = useMemo(() => SIMILAR.filter((g) => g.chars.some(([c]) => c === selected.char)), [selected])

  if (quiz) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
        <button type="button" className="label mb-6 min-h-11 text-soft" onClick={() => setQuiz(null)}>← Kanji Lab</button>
        <ExerciseRunner exercises={quiz} sessionKind="kanji" onFinish={(s) => { setSummary(s); setQuiz(null) }} />
      </div>
    )
  }

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8">
        <div>
          <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">漢字</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">Kanji Lab</h1>
        </div>
        <button type="button" className="btn btn-solid" onClick={() => { setSummary(null); setQuiz(kanjiQuiz(shuffled(KANJI, String(Date.now())).slice(0, 8), String(Date.now()))) }}>Reading practice (8) <span aria-hidden>→</span></button>
      </header>
      {summary && <p className="mb-6 border-l-4 border-red bg-muted p-4" role="status">Reading practice: {summary.correct} of {summary.total} correct.{summary.missed.length ? ` Missed: ${summary.missed.map((m) => m.prompt).join('、')}` : ''}</p>}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ul className="grid h-fit grid-cols-6 gap-px border border-line bg-line sm:grid-cols-10 lg:grid-cols-6" aria-label="Kanji">
          {KANJI.map((e) => (
            <li key={e.char}>
              <button type="button" lang="ja" aria-label={`${e.char}, ${e.meaning}`} aria-pressed={e === selected} onClick={() => setSelected(e)} className={`aspect-square w-full font-jp-serif text-2xl font-black ${e === selected ? 'bg-red text-[#f4f0e7]' : 'bg-paper hover:bg-muted'}`}>{e.char}</button>
            </li>
          ))}
        </ul>

        <article className="fade-up" key={selected.char}>
          <div className="grid grid-cols-[auto_1fr] items-end gap-6 border-t border-ink pt-4">
            <p lang="ja" className="font-jp-serif text-[9rem] leading-none font-black md:text-[12rem]">{selected.char}</p>
            <dl className="pb-3">
              <dt className="label text-soft">Meaning</dt><dd className="font-display text-3xl tracking-tight">{selected.meaning}</dd>
              <div className="mt-3 grid grid-cols-2 gap-x-4">
                <div><dt className="label text-soft">Strokes</dt><dd className="font-display text-2xl">{selected.strokes}</dd></div>
                <div><dt className="label text-soft">Radical</dt><dd lang="ja" className="font-jp text-2xl">{selected.radical}</dd></div>
              </div>
            </dl>
          </div>
          <dl className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-paper p-4"><dt className="label text-soft">On’yomi (Chinese-derived)</dt><dd lang="ja" className="mt-1 font-jp text-xl">{selected.on.join('、') || '—'}</dd></div>
            <div className="bg-paper p-4"><dt className="label text-soft">Kun’yomi (native Japanese)</dt><dd lang="ja" className="mt-1 font-jp text-xl">{selected.kun.join('、') || '—'}</dd></div>
          </dl>

          <h2 className="label mt-8 text-soft">Readings in real words</h2>
          <ul className="mt-2">
            {selected.compounds.map(([w, r, m]) => (
              <li key={w} className="grid grid-cols-[1fr_1fr_1fr] items-baseline gap-3 border-b border-line py-2.5">
                <span lang="ja" className="font-jp text-xl font-bold">{w}</span><span lang="ja" className="font-jp text-soft">{r}</span><span className="text-right">{m}</span>
              </li>
            ))}
          </ul>
          <h2 className="label mt-8 text-soft">Example</h2>
          <p className="mt-2 text-2xl leading-[2.1]"><JP text={selected.example[0]} /></p>
          <p className="text-soft">{selected.example[1]}</p>

          {similar.map((g) => (
            <section key={g.tip} className="mt-8 border-l-4 border-blue bg-muted p-5">
              <h2 className="label text-soft">Easily confused</h2>
              <div className="mt-3 flex flex-wrap gap-6">
                {g.chars.map(([c, r, m]) => <p key={c}><span lang="ja" className="font-jp-serif text-5xl font-black">{c}</span><span className="ml-2 text-sm text-soft"><span lang="ja">{r}</span> · {m}</span></p>)}
              </div>
              <p className="mt-3 leading-relaxed">{g.tip}</p>
            </section>
          ))}

          <WritingPad char={selected.char} strokes={selected.strokes} />

          <button type="button" className="btn mt-8" disabled={hasCard} onClick={() => update.mutate((s) => void s.cards.push(newCard('kanji', `kanji:${selected.char}`, selected.char, `${selected.meaning} — ${selected.compounds.map(([w, r]) => `${w}（${r}）`).join('、')}`, new Date(), [...selected.on, ...selected.kun].join('、'))))}>
            {hasCard ? 'In your revision deck' : 'Add to revision'}
          </button>
        </article>
      </div>
    </div>
  )
}

/** Free-hand tracing. It does not judge strokes: no stroke-order data ships with this build. */
function WritingPad({ char, strokes }: { char: string; strokes: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [count, setCount] = useState(0)
  const [guide, setGuide] = useState(true)
  const clear = () => { const c = ref.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); setCount(0) }
  useEffect(clear, [char])
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 300, ((e.clientY - r.top) / r.height) * 300] as const }
  return (
    <section className="mt-8">
      <h2 className="label text-soft">Writing practice</h2>
      <div className="relative mt-3 aspect-square w-full max-w-[300px] border border-ink bg-paper">
        {guide && <span lang="ja" aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center font-jp-serif text-[220px] leading-none font-black opacity-10">{char}</span>}
        <canvas
          ref={ref} width={300} height={300} className="absolute inset-0 h-full w-full touch-none" aria-label={`Drawing area for ${char}`}
          onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const ctx = e.currentTarget.getContext('2d')!; const [x, y] = pos(e); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = getComputedStyle(e.currentTarget).color; ctx.beginPath(); ctx.moveTo(x, y) }}
          onPointerMove={(e) => { if (!drawing.current) return; const ctx = e.currentTarget.getContext('2d')!; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke() }}
          onPointerUp={() => { if (drawing.current) { drawing.current = false; setCount((n) => n + 1) } }}
        />
      </div>
      <p className="mt-2 text-sm" aria-live="polite">Strokes drawn: <strong>{count}</strong> / {strokes}{count === strokes ? ' — stroke count matches.' : count > strokes ? ' — too many strokes; clear and try again.' : ''}</p>
      <div className="mt-2 flex gap-4">
        <button type="button" className="label min-h-11 border-b border-ink" onClick={clear}>Clear</button>
        <button type="button" className="label min-h-11 border-b border-ink" aria-pressed={guide} onClick={() => setGuide(!guide)}>Guide: {guide ? 'on' : 'off'}</button>
      </div>
      <p className="mt-3 border-l-2 border-blue pl-3 text-xs leading-relaxed text-soft">
        Animated stroke order is not available yet: it needs a stroke-path dataset (for example KanjiVG, CC BY-SA 3.0) which is not bundled. This pad only counts your strokes — it cannot check their order or shape.
      </p>
    </section>
  )
}
