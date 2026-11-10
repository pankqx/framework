import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CURRICULUM } from '@/modules/curriculum/structure'
import { LEVEL_LABEL } from '@/modules/learner/types'
import { useLearner } from '@/modules/learner/hooks'

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Honest labelling: what can be used today versus what is still being built. */
function Status({ live }: { live: boolean }) {
  return (
    <span className="label inline-flex items-center gap-2 text-soft">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-red' : 'border border-current'}`} />
      {live ? 'Available now' : 'In development'}
    </span>
  )
}

function SectionHead({ no, jp, title }: { no: string; jp: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-ink pt-4">
      <span className="label text-red">{no}</span>
      <span className="font-jp text-sm font-bold">{jp}</span>
      <h2 className="label ml-auto text-soft">{title}</h2>
    </div>
  )
}

const VERBS = [
  ['考える', 'kangaeru', 'think'],
  ['話す', 'hanasu', 'communicate'],
  ['読む', 'yomu', 'read'],
  ['書く', 'kaku', 'write'],
  ['生きる', 'ikiru', 'live'],
] as const

const DIFFERENT = [
  ['Nothing is decorative.', 'Every number you see is computed from what you actually did. No invented streaks, no progress bars that move by themselves.'],
  ['Wrong answers get reasons.', 'KOTOBA does not stop at correct or incorrect. Each choice explains why it works — or exactly why it does not.'],
  ['Sources are shown.', 'Official JLPT information is kept apart from supplementary teaching material, and each lesson carries its attribution.'],
  ['Mastery is earned by recall.', 'Finishing a lesson proves nothing. A concept counts as mastered only after repeated, spaced, successful recall.'],
] as const

const CHALLENGES = [
  ['30', '礎', 'Foundation and the writing systems', 'Hiragana, katakana, sound and rhythm, first kanji.'],
  ['60', '初', 'Beginner development', 'First sentences and the foundations of N5.'],
  ['90', '進', 'Consolidation and progression', 'N5 consolidated, N4 begun, a first look at intermediate study.'],
] as const

const SENSEI_MODES = [
  ['教', 'Teach'], ['問', 'Ask'], ['直', 'Correction'], ['話', 'Conversation'],
  ['浸', 'Immersion'], ['挑', 'Challenge'], ['文', 'Grammar'], ['読', 'Reading'],
] as const

const STUDIOS = [
  ['漢字', 'Kanji Lab', 'Readings in real vocabulary, stroke order, radicals and look-alike comparisons.', false],
  ['復習', 'Spaced revision', 'Again · Hard · Good · Easy — scheduled around your own recall, with custom cards.', false],
  ['聴・話', 'Speaking & Listening Studio', 'Slow and natural playback, transcripts on demand, honest microphone states.', false],
  ['読・書', 'Reading & Writing Studio', 'Graded passages with furigana control; sentences, paragraphs and a diary with feedback.', false],
  ['診断', 'Placement assessment', 'An adaptive check from kana to N3 that explains every answer and sets your starting point.', true],
  ['計画', 'Personal learning plan', 'Your daily minutes divided between new material and recall, shaped by your goal.', true],
] as const

export default function LandingPage() {
  const { data } = useLearner()
  const returning = Boolean(data?.profile && data.goals)
  const cta = returning ? { to: '/app', label: 'Continue learning', jp: 'つづける' } : { to: '/onboarding', label: 'Begin', jp: 'はじめる' }

  return (
    <div className="bg-paper text-ink">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="flex items-baseline gap-3" aria-label="KOTOBA home">
          <span className="font-display text-xl tracking-tight">KOTOBA</span>
          <span className="font-jp text-sm font-bold text-red">言葉</span>
        </Link>
        <nav aria-label="Sections" className="label hidden gap-8 md:flex">
          <a href="#philosophy" className="hover:text-red">Philosophy</a>
          <a href="#journey" className="hover:text-red">Journey</a>
          <a href="#sensei" className="hover:text-red">Sensei</a>
          <a href="#jlpt" className="hover:text-red">JLPT</a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to={cta.to} className="label hidden border-b border-ink pb-0.5 hover:border-red hover:text-red sm:block">
            {cta.label}
          </Link>
        </div>
      </header>

      <main>
        {/* 1 — Hero */}
        <section className="relative grid min-h-dvh grid-cols-12 items-end overflow-hidden px-5 pt-28 pb-10 md:px-10 md:pb-14">
          <span
            aria-hidden
            className="ink-in pointer-events-none absolute -top-[4vw] -right-[6vw] font-jp-serif text-[72vw] leading-[0.85] font-black text-red select-none md:text-[46vw]"
          >
            言
          </span>
          <p aria-hidden className="vertical label absolute top-28 left-5 hidden h-64 text-soft md:left-10 lg:block">
            言葉から、世界が広がる。
          </p>

          <div className="relative col-span-12 lg:col-span-9 lg:col-start-2">
            <p className="label fade-up mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-ink" />
              AI-powered Japanese learning
            </p>
            <h1 lang="ja" className="fade-up font-jp-serif text-[12vw] leading-[1.08] font-black tracking-tight md:text-[8.2vw]" style={{ animationDelay: '0.1s' }}>
              日本語を、
              <br />
              人生の一部に。
            </h1>
            <p className="fade-up mt-5 font-display text-2xl italic md:text-3xl" style={{ animationDelay: '0.2s' }}>
              Make Japanese a part of your life.
            </p>
            <div className="fade-up mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end" style={{ animationDelay: '0.3s' }}>
              <p className="max-w-md text-base leading-relaxed text-soft">
                An intelligent Japanese learning environment designed to take you from your first Japanese sentence to advanced language mastery.
              </p>
              <Link to={cta.to} className="btn btn-solid justify-between md:min-w-64">
                <span>{cta.label}</span>
                <span lang="ja" className="font-jp tracking-normal">{cta.jp} →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2 — Philosophy */}
        <section id="philosophy" className="px-5 py-20 md:px-10 md:py-32">
          <SectionHead no="01" jp="哲学" title="Philosophy" />
          <div className="mt-12 grid grid-cols-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-7">
              <p className="font-display text-4xl leading-[1.1] tracking-tight md:text-6xl">
                Don’t just learn Japanese. <em className="text-red">Learn to think, communicate, read, write and live</em> in Japanese.
              </p>
            </Reveal>
            <ul className="col-span-12 md:col-span-4 md:col-start-9">
              {VERBS.map(([jp, romaji, en], i) => (
                <Reveal key={jp} delay={i * 0.06}>
                  <li className="flex items-baseline justify-between border-b border-line py-3">
                    <span lang="ja" className="font-jp-serif text-3xl font-black">{jp}</span>
                    <span className="text-right">
                      <span className="block text-sm">{en}</span>
                      <span className="label text-soft">{romaji}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* 3 — Why different */}
        <section className="bg-muted px-5 py-20 md:px-10 md:py-28">
          <SectionHead no="02" jp="違い" title="Why KOTOBA is different" />
          <ol className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {DIFFERENT.map(([title, body], i) => (
              <Reveal key={title} delay={(i % 2) * 0.08} className={i % 2 ? 'md:mt-20' : ''}>
                <li className="grid grid-cols-[auto_1fr] gap-x-6">
                  <span aria-hidden className="font-display text-7xl leading-none text-red italic">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl tracking-tight md:text-3xl">{title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-soft">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* 4 — Journey */}
        <section id="journey" className="py-20 md:py-32">
          <div className="px-5 md:px-10">
            <SectionHead no="03" jp="道" title="The learning journey" />
            <p className="mt-12 max-w-2xl font-display text-3xl leading-tight tracking-tight md:text-5xl">
              Six stages. One continuous road from <span lang="ja" className="font-jp-serif font-black">あ</span> to nuance.
            </p>
          </div>
          <ol className="mt-12 flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-ink bg-ink px-px md:grid md:grid-cols-6 md:overflow-visible">
            {CURRICULUM.map((stage, i) => (
              <li key={stage.level} className="flex min-w-[68vw] snap-start flex-col bg-paper p-5 sm:min-w-[40vw] md:min-w-0">
                <span className="label text-soft">{String(i).padStart(2, '0')}</span>
                <span lang="ja" aria-hidden className={`mt-6 font-jp-serif text-7xl font-black ${stage.level === 'n3' ? 'text-red' : ''}`}>
                  {stage.kanji}
                </span>
                <h3 className="mt-6 font-display text-xl tracking-tight">{LEVEL_LABEL[stage.level]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{stage.summary}</p>
                <p className="label mt-auto pt-6 text-soft">{stage.modules.length} modules planned</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 px-5 text-xs text-soft md:px-10">
            The structure above is built. Lesson content is being written level by level from attributed references and appears only once it is verified.
          </p>
        </section>

        {/* 5 — Challenges */}
        <section className="px-5 py-20 md:px-10 md:py-28">
          <SectionHead no="04" jp="挑戦" title="30 / 60 / 90-day challenges" />
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {CHALLENGES.map(([days, kanji, title, body], i) => (
              <Reveal key={days} delay={i * 0.08}>
                <article className="relative border-t-4 border-ink pt-4">
                  <span lang="ja" aria-hidden className="absolute top-4 right-0 font-jp-serif text-2xl font-black text-red">{kanji}</span>
                  <p className="font-display text-[7rem] leading-none tracking-tighter md:text-[9rem]">{days}</p>
                  <p className="label -mt-2">days</p>
                  <h3 className="mt-6 font-display text-2xl tracking-tight">{title}</h3>
                  <p className="mt-2 leading-relaxed text-soft">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
            <p className="max-w-xl text-sm text-soft">
              Daily tasks, weekly assessment and a final evaluation, scaled to the minutes you have. A challenge gives structure — it does not promise fluency or a JLPT result.
            </p>
            <Status live={false} />
          </div>
        </section>

        {/* 6 — AI Sensei (always dark: an inversion in the page rhythm) */}
        <section id="sensei" className="bg-[#141414] px-5 py-20 text-[#f4f0e7] md:px-10 md:py-32">
          <div className="flex items-baseline gap-4 border-t border-[#f4f0e7] pt-4">
            <span className="label text-[#ee5e48]">05</span>
            <span lang="ja" className="font-jp text-sm font-bold">先生</span>
            <h2 className="label ml-auto opacity-60">AI Sensei</h2>
          </div>
          <div className="mt-12 grid grid-cols-12 gap-y-14 md:gap-x-10">
            <div className="col-span-12 md:col-span-6">
              <Reveal>
                <p lang="ja" aria-hidden className="font-jp-serif text-[28vw] leading-none font-black text-[#ee5e48] md:text-[15vw]">先生</p>
                <p className="mt-6 max-w-md font-display text-3xl leading-tight tracking-tight">
                  A tutor that knows your level, your lesson and the things you keep getting wrong.
                </p>
                <p className="mt-4 max-w-md leading-relaxed opacity-70">
                  Sensei is grounded in the curriculum, separates formal, casual and natural spoken Japanese, and says so when it is not certain.
                </p>
              </Reveal>
              <ul className="mt-10 grid grid-cols-4 gap-px bg-[#f4f0e72e]">
                {SENSEI_MODES.map(([jp, en]) => (
                  <li key={en} className="bg-[#141414] py-4 text-center">
                    <span lang="ja" className="block font-jp-serif text-2xl font-black">{jp}</span>
                    <span className="mt-1 block text-[0.625rem] tracking-widest uppercase opacity-60">{en}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Reveal delay={0.1} className="col-span-12 md:col-span-5 md:col-start-8">
              <figure className="border border-[#f4f0e72e] p-6">
                <figcaption className="label opacity-60">Illustration — correction format</figcaption>
                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="label opacity-60">Original</dt>
                    <dd lang="ja" className="mt-1 font-jp text-xl line-through decoration-[#ee5e48] decoration-2">きのう えいがを みます。</dd>
                  </div>
                  <div>
                    <dt className="label opacity-60">Corrected</dt>
                    <dd lang="ja" className="mt-1 font-jp text-xl">きのう えいがを <span className="text-[#ee5e48]">みました</span>。</dd>
                  </div>
                  <div>
                    <dt className="label opacity-60">Why</dt>
                    <dd className="mt-1 leading-relaxed opacity-80">きのう places the action in the past, so the verb needs the past form: みます → みました.</dd>
                  </div>
                  <div>
                    <dt className="label opacity-60">Natural, casual</dt>
                    <dd lang="ja" className="mt-1 font-jp text-xl">きのう えいが みた。</dd>
                  </div>
                </dl>
              </figure>
              <p className="label mt-4 flex items-center gap-2 opacity-60">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-current" /> In development
              </p>
            </Reveal>
          </div>
        </section>

        {/* 7 — Features */}
        <section className="px-5 py-20 md:px-10 md:py-28">
          <SectionHead no="06" jp="工房" title="Interactive learning" />
          <ul className="mt-12">
            {STUDIOS.map(([jp, title, body, live]) => (
              <li key={title} className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 border-b border-line py-6 transition-colors hover:bg-muted">
                <span lang="ja" className="col-span-12 font-jp-serif text-4xl font-black transition-colors group-hover:text-red md:col-span-2 md:text-5xl">{jp}</span>
                <h3 className="col-span-12 font-display text-2xl tracking-tight md:col-span-3">{title}</h3>
                <p className="col-span-12 leading-relaxed text-soft md:col-span-5">{body}</p>
                <span className="col-span-12 md:col-span-2 md:text-right"><Status live={live} /></span>
              </li>
            ))}
          </ul>
        </section>

        {/* 8 — JLPT */}
        <section id="jlpt" className="bg-muted px-5 py-20 md:px-10 md:py-28">
          <SectionHead no="07" jp="試験" title="JLPT preparation" />
          <div className="mt-12 grid grid-cols-12 gap-y-10 md:gap-x-10">
            <Reveal className="col-span-12 md:col-span-5">
              <p className="font-display text-[9rem] leading-[0.8] tracking-tighter text-red md:text-[14rem]">N3</p>
              <p className="mt-6 max-w-sm leading-relaxed text-soft">
                Original practice questions in the official question formats, timed like the real examination. A practice score here is never an official JLPT score.
              </p>
              <div className="mt-4"><Status live={false} /></div>
            </Reveal>
            <div className="col-span-12 md:col-span-6 md:col-start-7">
              <p className="label text-soft">N3 examination structure</p>
              <ul className="mt-4">
                {([['言語知識（文字・語彙）', 'Language knowledge — vocabulary', 30], ['言語知識（文法）・読解', 'Language knowledge — grammar · reading', 70], ['聴解', 'Listening', 40]] as const).map(([jp, en, min]) => (
                  <li key={en} className="border-t border-ink py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p lang="ja" className="font-jp text-lg font-bold">{jp}</p>
                        <p className="text-sm text-soft">{en}</p>
                      </div>
                      <p className="font-display text-4xl tracking-tight whitespace-nowrap">{min}<span className="label ml-1">min</span></p>
                    </div>
                    <div aria-hidden className="mt-3 h-1 bg-line">
                      <div className="h-full bg-ink" style={{ width: `${(min / 70) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 9 — Tech Lab */}
        <section className="px-5 py-20 md:px-10 md:py-28">
          <SectionHead no="08" jp="技術" title="Japanese for developers" />
          <div className="mt-12 grid grid-cols-12 gap-y-10 md:gap-x-10">
            <Reveal className="col-span-12 md:col-span-5">
              <h3 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">KOTOBA <em className="text-blue">Tech Lab</em></h3>
              <p className="mt-4 max-w-md leading-relaxed text-soft">
                Learn Japanese through software engineering: documentation, code comments, architecture vocabulary and technical interviews. Code stays in its real language — only the human parts are in Japanese.
              </p>
              <div className="mt-4"><Status live={false} /></div>
            </Reveal>
            <Reveal delay={0.1} className="col-span-12 md:col-span-6 md:col-start-7">
              <pre className="overflow-x-auto bg-[#141414] p-6 text-sm leading-7 text-[#f4f0e7]"><code>
<span className="text-[#7d8ff0]">{'// IDからユーザーを取得する'}</span>{'\n'}
{'const user = await getUser(id)\n\n'}
<span className="text-[#7d8ff0]">{'// 見つからない場合はエラーを返す'}</span>{'\n'}
{'if (!user) throw new NotFoundError()'}
              </code></pre>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-4">
                {([['取得', 'しゅとく', 'fetch'], ['場合', 'ばあい', 'case'], ['返す', 'かえす', 'return'], ['関数', 'かんすう', 'function']] as const).map(([w, r, mean]) => (
                  <div key={w} className="border-t border-line py-3">
                    <dt lang="ja" className="font-jp text-xl font-bold">{w}</dt>
                    <dd className="text-soft"><span lang="ja">{r}</span> · {mean}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* 10 — Final CTA */}
        <section className="relative overflow-hidden bg-red px-5 py-24 text-[#f4f0e7] md:px-10 md:py-40">
          <span aria-hidden className="pointer-events-none absolute -right-8 -bottom-16 font-jp-serif text-[60vw] leading-none font-black text-[#171717] opacity-15 select-none md:text-[34vw]">葉</span>
          <Reveal className="relative">
            <p lang="ja" className="font-jp-serif text-[11vw] leading-tight font-black md:text-[6.5vw]">言葉から、世界が広がる。</p>
            <p className="mt-3 font-display text-2xl italic md:text-3xl">Through language, the world opens up.</p>
            <Link to={cta.to} className="btn mt-12 border-[#f4f0e7] hover:!bg-[#f4f0e7] hover:!text-[#171717]">
              {returning ? 'Continue learning' : 'Take the placement assessment'} <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </section>
      </main>

      {/* 11 — Footer */}
      <footer className="px-5 py-10 md:px-10">
        <div className="grid gap-8 border-t border-ink pt-6 md:grid-cols-3">
          <div>
            <p className="font-jp-serif text-3xl font-black text-red">言葉</p>
            <p className="label mt-1">Kotoba — Japanese only</p>
          </div>
          <p className="text-sm leading-relaxed text-soft">
            A personal-use soft launch. KOTOBA is an independent study tool and is not affiliated with or endorsed by the organisers of the JLPT.
          </p>
          <div className="md:text-right">
            <p className="label">Designed &amp; engineered with curiosity.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
