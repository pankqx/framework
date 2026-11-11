import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLearner } from '@/modules/learner/hooks'
import { LEVEL_LABEL, type Skill } from '@/modules/learner/types'
import { formatDuration, lastSevenDays, secondsOn, skillAccuracy, streak, weakConcepts } from '@/modules/analytics/stats'
import { levelProgress, nextLesson } from '@/content/lessons'
import { dueCards, masteredCards, upcomingCards } from '@/modules/revision/srs'
import { generatePlan } from '@/modules/onboarding/plan'
import { PlanView } from '@/modules/onboarding/PlanView'
import { Skeleton } from '@/components/Loader'

const greeting = (hour: number): [string, string] =>
  hour < 11 ? ['おはようございます', 'Good morning'] : hour < 18 ? ['こんにちは', 'Hello'] : ['こんばんは', 'Good evening']

const SKILL_ROWS: { skill: Skill; jp: string; label: string }[] = [
  { skill: 'kana', jp: '仮名', label: 'Kana' },
  { skill: 'vocabulary', jp: '語彙', label: 'Vocabulary' },
  { skill: 'kanji', jp: '漢字', label: 'Kanji' },
  { skill: 'grammar', jp: '文法', label: 'Grammar' },
  { skill: 'reading', jp: '読解', label: 'Reading' },
  { skill: 'listening', jp: '聴解', label: 'Listening' },
]

function Panel({ no, jp, title, children, className = '' }: { no: string; jp: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border-t border-ink pt-3 ${className}`} aria-labelledby={`p-${no}`}>
      <div className="flex items-baseline gap-3">
        <span className="label text-red">{no}</span>
        <span lang="ja" className="font-jp text-sm font-bold">{jp}</span>
        <h2 id={`p-${no}`} className="label ml-auto text-soft">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const Empty = ({ children }: { children: ReactNode }) => <p className="text-sm leading-relaxed text-soft">{children}</p>

export default function DashboardPage() {
  const { data } = useLearner()
  if (!data?.profile || !data.goals) {
    return (
      <div className="space-y-6 p-5 md:p-10">
        <Skeleton className="h-24 w-2/3" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  const { profile, goals, sessions, attempts, assessmentResults, lessonCompletions, cards, examResults } = data
  const now = new Date()
  const [jpHello, enHello] = greeting(now.getHours())

  const todaySeconds = secondsOn(sessions, now)
  const targetSeconds = goals.dailyMinutes * 60
  const objective = Math.min(1, todaySeconds / targetSeconds)
  const days = streak(sessions, now)
  const week = lastSevenDays(sessions, now)
  const weekSeconds = week.reduce((n, d) => n + d.seconds, 0)
  const weekMax = Math.max(targetSeconds, ...week.map((d) => d.seconds))
  const accuracy = skillAccuracy(attempts)
  const weak = weakConcepts(attempts)
  const plan = generatePlan(goals, profile.currentLevel)
  const lesson = nextLesson(profile.currentLevel, lessonCompletions)
  const due = dueCards(cards, now)
  const upcoming = upcomingCards(cards, now)
  const mastered = masteredCards(cards)
  const targetProgress = levelProgress(goals.jlptTarget, lessonCompletions)
  const exams = examResults.filter((e) => e.level === goals.jlptTarget)
  const placement = [...assessmentResults].reverse().find((r) => r.kind === 'placement')

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      {/* Masthead */}
      <header className="relative grid grid-cols-12 items-end gap-y-6 pb-10">
        <div className="col-span-12 lg:col-span-8">
          <p className="label text-soft">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-3">
            <span lang="ja" className="block font-jp-serif text-[11vw] leading-tight font-black md:text-7xl">{jpHello}、</span>
            <span className="block font-display text-3xl tracking-tight italic md:text-4xl">{enHello}, {profile.displayName}.</span>
          </h1>
        </div>
        <dl className="col-span-12 grid grid-cols-3 gap-px border border-line bg-line lg:col-span-4">
          <Stat label="Level" value={LEVEL_LABEL[profile.currentLevel].replace('JLPT ', '')} note={profile.levelSource === 'placement' ? 'by placement' : 'self-estimated'} />
          <Stat label="Target" value={LEVEL_LABEL[goals.jlptTarget].replace('JLPT ', '')} note="JLPT" />
          <Stat label="Streak" value={String(days)} note={days === 1 ? 'day' : 'days'} accent={days > 0} />
        </dl>
      </header>

      <div className="grid grid-cols-12 gap-y-12 lg:gap-x-10">
        {/* Today */}
        <Panel no="01" jp="今日" title="Today’s objective" className="col-span-12 lg:col-span-7">
          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-6xl tracking-tighter md:text-8xl">
              {Math.floor(todaySeconds / 60)}
              <span className="text-3xl text-soft md:text-4xl"> / {goals.dailyMinutes} min</span>
            </p>
            <p className="label pb-2 text-soft">{Math.round(objective * 100)}%</p>
          </div>
          <div className="mt-4 h-2 bg-line" role="progressbar" aria-label="Today’s study time against your daily objective" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(objective * 100)}>
            <div className="h-full bg-red transition-[width] duration-700" style={{ width: `${objective * 100}%` }} />
          </div>

          <div className="mt-8 border border-line p-5">
            <p className="label text-red">Recommended next</p>
            {!placement ? (
              <>
                <h3 className="mt-2 font-display text-3xl tracking-tight">Take the placement assessment</h3>
                <p className="mt-2 leading-relaxed text-soft">Your level is currently your own estimate. Ten minutes will position your plan properly and reveal your first weak points.</p>
                <Link to="/onboarding?retake=1" className="btn btn-solid mt-5">Start assessment <span aria-hidden>→</span></Link>
              </>
            ) : due.length > 0 ? (
              <>
                <p lang="ja" className="mt-2 font-jp-serif text-5xl font-black">復習</p>
                <h3 className="mt-2 font-display text-3xl tracking-tight">{due.length} card{due.length === 1 ? '' : 's'} due for revision</h3>
                <p className="mt-2 leading-relaxed text-soft">Recall first, then new material{lesson ? `: ${lesson.title}` : ''}.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/app/review" className="btn btn-solid">Review now <span aria-hidden>→</span></Link>
                  {lesson && <Link to={`/app/lesson/${lesson.slug}`} className="btn">Today’s lesson</Link>}
                </div>
              </>
            ) : lesson ? (
              <>
                <p lang="ja" className="mt-2 font-jp-serif text-5xl font-black break-words">{lesson.jp}</p>
                <h3 className="mt-2 font-display text-3xl tracking-tight">{LEVEL_LABEL[lesson.level]} · {lesson.title}</h3>
                <p className="mt-2 leading-relaxed text-soft">{lesson.objective}</p>
                <Link to={`/app/lesson/${lesson.slug}`} className="btn btn-solid mt-5">{lessonCompletions.length ? 'Continue learning' : 'Start today’s lesson'} <span aria-hidden>→</span></Link>
              </>
            ) : (
              <>
                <h3 className="mt-2 font-display text-3xl tracking-tight">Every published lesson is complete</h3>
                <p className="mt-2 leading-relaxed text-soft">Keep your revision going and practise in the studios while more lessons are written.</p>
                <Link to="/app/more" className="btn mt-5">Open the studios <span aria-hidden>→</span></Link>
              </>
            )}
          </div>
        </Panel>

        {/* Week */}
        <Panel no="02" jp="一週間" title="This week" className="col-span-12 lg:col-span-5">
          <p className="font-display text-5xl tracking-tighter">{formatDuration(weekSeconds)}</p>
          <p className="label mt-1 text-soft">studied in the last 7 days</p>
          <ol className="mt-6 grid h-36 grid-cols-7 items-end gap-2" aria-label="Study time per day, last seven days">
            {week.map((d) => (
              <li key={d.key} className="flex h-full flex-col justify-end" aria-label={`${d.key}: ${formatDuration(d.seconds)}`}>
                <div className={`w-full ${d.isToday ? 'bg-red' : 'bg-ink'}`} style={{ height: d.seconds > 0 ? `${Math.max(4, (d.seconds / weekMax) * 100)}%` : '1px' }} />
                <span lang="ja" aria-hidden className={`mt-2 text-center font-jp text-sm ${d.isToday ? 'font-bold text-red' : 'text-soft'}`}>{d.weekday}</span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Weak concepts */}
        <Panel no="03" jp="弱点" title="Weak concepts" className="col-span-12 lg:col-span-7">
          {weak.length === 0 ? (
            <Empty>{attempts.length === 0 ? 'Nothing recorded yet. Weak points appear here from the answers you get wrong.' : 'No weak concepts right now — every concept you have attempted was answered correctly most recently.'}</Empty>
          ) : (
            <ul>
              {weak.map((c) => (
                <li key={c.conceptKey} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span lang="ja" className="font-jp font-medium">{c.label}</span>
                  <span className="label whitespace-nowrap text-soft">{c.correct} right · <span className="text-red">{c.incorrect} missed</span></span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Skills */}
        <Panel no="04" jp="技能" title="Accuracy by skill" className="col-span-12 lg:col-span-5">
          <ul>
            {SKILL_ROWS.map(({ skill, jp, label }) => {
              const row = accuracy.find((a) => a.skill === skill)
              const pct = row ? Math.round((row.correct / row.total) * 100) : null
              return (
                <li key={skill} className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-3 border-b border-line py-3">
                  <span lang="ja" className="font-jp font-bold">{jp}</span>
                  <span>
                    <span className="text-sm">{label}</span>
                    <span aria-hidden className="mt-1 block h-1 bg-line">{pct !== null && <span className="block h-full bg-ink" style={{ width: `${pct}%` }} />}</span>
                  </span>
                  <span className="label text-soft">{row ? `${row.correct}/${row.total} correct` : 'No activity yet'}</span>
                </li>
              )
            })}
          </ul>
        </Panel>

        {/* Revision */}
        <Panel no="05" jp="復習" title="Revision & mastery" className="col-span-12 md:col-span-6 lg:col-span-4">
          <dl className="grid grid-cols-3 gap-px border border-line bg-line">
            <Stat label="Due now" value={String(due.length)} note="cards" accent={due.length > 0} />
            <Stat label="Next 7 days" value={String(upcoming.length)} note="cards" />
            <Stat label="Mastered" value={String(mastered.length)} note={`of ${cards.length}`} />
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-soft">
            {cards.length === 0 ? 'No revision cards yet — completing a lesson adds its vocabulary and grammar.' : 'Mastered means recalled successfully several times in a row at a long interval — never just “lesson finished”.'}
          </p>
          <Link to="/app/review" className="label mt-3 inline-flex min-h-11 items-center border-b border-ink hover:border-red hover:text-red">Open revision</Link>
        </Panel>

        {/* JLPT */}
        <Panel no="06" jp="試験" title={`Towards ${LEVEL_LABEL[goals.jlptTarget]}`} className="col-span-12 md:col-span-6 lg:col-span-3">
          {placement ? (
            <ul>
              {placement.bands.map((b) => (
                <li key={b.level} className="flex items-baseline justify-between border-b border-line py-2.5">
                  <span>{LEVEL_LABEL[b.level]}</span>
                  <span className={`label ${b.passed ? '' : 'text-red'}`}>{b.correct}/{b.total} · {b.passed ? 'passed' : 'not yet'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No assessment taken yet.</Empty>
          )}
          <ul className="mt-3">
            <li className="flex items-baseline justify-between border-b border-line py-2.5"><span>Lessons at target level</span><span className="label">{targetProgress.total ? `${targetProgress.done}/${targetProgress.total}` : 'none published'}</span></li>
            <li className="flex items-baseline justify-between border-b border-line py-2.5"><span>Practice exams taken</span><span className="label">{exams.length}{exams.length ? ` · ${exams.reduce((n, e) => n + e.correct, 0)}/${exams.reduce((n, e) => n + e.total, 0)} correct` : ''}</span></li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-soft">Practice results only. These are not JLPT scores.</p>
          <Link to="/app/jlpt" className="label mt-2 inline-flex min-h-11 items-center border-b border-ink hover:border-red hover:text-red">Examination centre</Link>
        </Panel>

        {/* Plan */}
        <Panel no="07" jp="計画" title="Your daily plan" className="col-span-12 lg:col-span-5">
          <PlanView plan={plan} current={profile.currentLevel} />
          <Link to="/app/settings" className="label mt-5 inline-flex min-h-11 items-center border-b border-ink hover:border-red hover:text-red">Change goals</Link>
        </Panel>
      </div>
    </div>
  )
}

function Stat({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className="bg-paper p-4">
      <dt className="label text-soft">{label}</dt>
      <dd className={`mt-2 font-display text-4xl tracking-tight ${accent ? 'text-red' : ''}`}>{value}</dd>
      <dd className="label text-soft">{note}</dd>
    </div>
  )
}
