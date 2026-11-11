import { Link } from 'react-router-dom'
import { useLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL } from '@/modules/learner/types'
import { isCompleted, LESSONS, lessonsIn, levelProgress } from '@/content/lessons'
import { CURRICULUM } from './structure'

export default function CurriculumPage() {
  const { data } = useLearner()
  const current = data?.profile?.currentLevel
  const target = data?.goals?.jlptTarget
  const completions = data?.lessonCompletions ?? []

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="pb-10">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">道</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Curriculum</h1>
        <p className="mt-4 max-w-2xl border-l-2 border-blue pl-4 text-sm leading-relaxed text-soft">
          {LESSONS.length} lessons are published; you have completed {completions.filter((c, i, a) => a.findIndex((x) => x.slug === c.slug) === i).length}. Modules marked “Outline” have a planned
          structure but no lessons yet. Lessons are original KOTOBA material, not yet reviewed by a qualified teacher, and nothing here is an official JLPT syllabus.
        </p>
      </header>

      <ol>
        {CURRICULUM.map((stage) => {
          const progress = levelProgress(stage.level, completions)
          return (
            <li key={stage.level} className="grid grid-cols-12 gap-y-4 border-t border-ink py-8 md:gap-x-6">
              <div className="col-span-12 md:col-span-4">
                <div className="flex items-start gap-4">
                  <span lang="ja" aria-hidden className={`font-jp-serif text-6xl leading-none font-black ${stage.level === current ? 'text-red' : ''}`}>{stage.kanji}</span>
                  <div>
                    <h2 className="font-display text-2xl tracking-tight">{LEVEL_LABEL[stage.level]}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-soft">{stage.summary}</p>
                    <p className="label mt-2 text-soft">{progress.total ? `${progress.done} / ${progress.total} lessons completed` : 'No lessons published yet'}</p>
                    <p className="mt-2 flex flex-wrap gap-2">
                      {stage.level === current && <span className="label bg-red px-2 py-1 text-[#f4f0e7]">You are here</span>}
                      {stage.level === target && <span className="label border border-ink px-2 py-1">Your target</span>}
                    </p>
                  </div>
                </div>
              </div>
              <ul className="col-span-12 md:col-span-8">
                {stage.modules.map((mod, i) => {
                  const lessons = lessonsIn(stage.level, mod.slug)
                  return (
                    <li key={mod.slug} className="border-b border-line py-3">
                      <div className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3">
                        <span className="label text-soft">{String(i + 1).padStart(2, '0')}</span>
                        <span>
                          <span className="font-medium">{mod.title}</span> <span lang="ja" className="ml-1 font-jp text-sm text-soft">{mod.jp}</span>
                          <span className="block text-sm text-soft">{mod.topics.join(' · ')}</span>
                        </span>
                        <span className="label text-soft">{lessons.length ? `${lessons.length} lesson${lessons.length === 1 ? '' : 's'}` : 'Outline'}</span>
                      </div>
                      {lessons.length > 0 && (
                        <ul className="mt-2 ml-[2.75rem] grid gap-px border border-line bg-line sm:grid-cols-2">
                          {lessons.map((l) => {
                            const done = isCompleted(l.slug, completions)
                            return (
                              <li key={l.slug}>
                                <Link to={`/app/lesson/${l.slug}`} className="flex min-h-12 items-center justify-between gap-3 bg-paper px-3 py-2 hover:bg-muted">
                                  <span className="text-sm">{l.title}</span>
                                  <span className={`label whitespace-nowrap ${done ? 'text-red' : 'text-soft'}`}>{done ? '済 done' : `${l.minutes} min`}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
