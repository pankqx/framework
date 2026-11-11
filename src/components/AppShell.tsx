import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { repository, storagePersistent } from '@/modules/learner/repository'

export const NAV = [
  { to: '/app', jp: '今日', label: 'Today', end: true, mobile: true },
  { to: '/app/curriculum', jp: '道', label: 'Curriculum', end: false, mobile: true },
  { to: '/app/review', jp: '復習', label: 'Revision', end: false, mobile: true },
  { to: '/app/kanji', jp: '漢字', label: 'Kanji Lab', end: false, mobile: false },
  { to: '/app/sensei', jp: '先生', label: 'AI Sensei', end: false, mobile: true },
  { to: '/app/reading', jp: '読む', label: 'Reading', end: false, mobile: false },
  { to: '/app/listening', jp: '聴く', label: 'Listen & Speak', end: false, mobile: false },
  { to: '/app/writing', jp: '書く', label: 'Writing', end: false, mobile: false },
  { to: '/app/jlpt', jp: '試験', label: 'JLPT Centre', end: false, mobile: false },
  { to: '/app/tech', jp: '技術', label: 'Tech Lab', end: false, mobile: false },
  { to: '/app/challenges', jp: '挑戦', label: 'Challenges', end: false, mobile: false },
  { to: '/app/analytics', jp: '分析', label: 'Analytics', end: false, mobile: false },
  { to: '/app/settings', jp: '設定', label: 'Settings', end: false, mobile: false },
]
const MOBILE_NAV = [...NAV.filter((n) => n.mobile), { to: '/app/more', jp: '全部', label: 'More', end: false, mobile: true }]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[13rem_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>

      {/* Desktop: a narrow editorial rail. */}
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between gap-6 overflow-y-auto border-r border-line p-6 md:flex">
        <div>
          <Link to="/" className="block" aria-label="KOTOBA home">
            <span className="font-jp-serif text-4xl font-black text-red">言葉</span>
            <span className="label mt-1 block">Kotoba</span>
          </Link>
          <nav aria-label="Primary" className="mt-8 flex flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-baseline gap-3 border-t border-line py-2 transition-colors last:border-b ${isActive ? 'text-red' : 'hover:text-red'}`
                }
              >
                <span className="w-10 font-jp text-base font-bold">{item.jp}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div>
          <StorageNote />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile: top bar + bottom tab bar within thumb reach. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper px-5 py-2 md:hidden">
        <Link to="/" className="font-jp-serif text-2xl font-black text-red" aria-label="KOTOBA home">
          言葉
        </Link>
        <ThemeToggle />
      </header>

      <main id="main" className="min-w-0 pb-24 md:pb-0">
        {children}
      </main>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper md:hidden">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 ${isActive ? 'text-red' : ''}`}
          >
            <span className="font-jp text-lg leading-none font-bold">{item.jp}</span>
            <span className="text-[0.625rem] tracking-widest uppercase">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function StorageNote() {
  return (
    <p className="mb-3 border-l-2 border-blue pl-3 text-xs leading-relaxed text-soft">
      {repository.mode === 'local'
        ? storagePersistent
          ? 'Local mode — progress is saved in this browser only.'
          : 'Storage is blocked — progress will be lost when this tab closes.'
        : 'Synced to your account.'}
    </p>
  )
}
