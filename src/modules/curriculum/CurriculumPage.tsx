import { useLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL } from '@/modules/learner/types'
import { CURRICULUM, publishedLessonCount } from './structure'

export default function CurriculumPage() {
  const { data } = useLearner()
  const current = data?.profile?.currentLevel
  const target = data?.goals?.jlptTarget

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="pb-10">
        <p lang="ja" className="font-jp-serif text-7xl font-black md:text-8xl">道</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Curriculum</h1>
        <p className="mt-4 max-w-2xl border-l-2 border-blue pl-4 text-sm leading-relaxed text-soft">
          This is the curriculum architecture: levels and module outlines. {publishedLessonCount()} lessons are published so far. Lessons are added level by
          level from attributed references, with official JLPT information kept separate from supplementary material — nothing here is presented as an
          officially verified syllabus.
        </p>
      </header>

      <ol>
        {CURRICULUM.map((stage) => (
          <li key={stage.level} className="grid grid-cols-12 gap-x-6 gap-y-4 border-t border-ink py-8">
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-start gap-4">
                <span lang="ja" aria-hidden className={`font-jp-serif text-6xl leading-none font-black ${stage.level === current ? 'text-red' : ''}`}>{stage.kanji}</span>
                <div>
                  <h2 className="font-display text-2xl tracking-tight">{LEVEL_LABEL[stage.level]}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-soft">{stage.summary}</p>
                  <p className="mt-2 flex flex-wrap gap-2">
                    {stage.level === current && <span className="label bg-red px-2 py-1 text-[#f4f0e7]">You are here</span>}
                    {stage.level === target && <span className="label border border-ink px-2 py-1">Your target</span>}
                  </p>
                </div>
              </div>
            </div>
            <ul className="col-span-12 md:col-span-8">
              {stage.modules.map((mod, i) => (
                <li key={mod.slug} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 border-b border-line py-3">
                  <span className="label text-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="font-medium">{mod.title}</span> <span lang="ja" className="ml-1 font-jp text-sm text-soft">{mod.jp}</span>
                    <span className="block text-sm text-soft">{mod.topics.join(' · ')}</span>
                  </span>
                  <span className="label text-soft">{mod.lessonsPublished > 0 ? `${mod.lessonsPublished} lessons` : 'Outline'}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
