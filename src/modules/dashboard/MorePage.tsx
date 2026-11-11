import { Link } from 'react-router-dom'
import { NAV } from '@/components/AppShell'

/** Mobile hub: every area of the app, since the bottom bar only fits five. */
export default function MorePage() {
  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <p lang="ja" className="font-jp-serif text-7xl font-black">全部</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Everything</h1>
      <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {NAV.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="flex min-h-20 items-center gap-4 bg-paper px-4 hover:bg-muted">
              <span lang="ja" className="w-14 font-jp-serif text-2xl font-black text-red">{item.jp}</span>
              <span className="font-display text-xl tracking-tight">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
