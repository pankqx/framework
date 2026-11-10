import { LEVEL_LABEL, type Level } from '@/modules/learner/types'
import type { LearningPlan } from './plan'

export function PlanView({ plan, current }: { plan: LearningPlan; current: Level }) {
  return (
    <div>
      <p className="label text-soft">Your path</p>
      <ol className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-2xl tracking-tight">
        {plan.path.map((level, i) => (
          <li key={level} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="h-px w-6 bg-ink" />}
            <span className={level === current ? 'text-red' : ''}>{LEVEL_LABEL[level]}</span>
          </li>
        ))}
      </ol>

      <p className="label mt-8 text-soft">A {plan.dailyMinutes}-minute day</p>
      <div className="mt-3 flex h-3 w-full" role="img" aria-label={plan.blocks.map((b) => `${b.label} ${b.minutes} minutes`).join(', ')}>
        {plan.blocks.map((b, i) => (
          <div key={b.key} style={{ width: `${(b.minutes / plan.dailyMinutes) * 100}%`, opacity: 1 - i * 0.17 }} className={i === 0 ? 'bg-red' : 'bg-ink'} />
        ))}
      </div>
      <ul className="mt-4">
        {plan.blocks.map((b) => (
          <li key={b.key} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
            <span>
              <span className="font-medium">{b.label}</span>
              <span className="block text-sm text-soft">{b.detail}</span>
            </span>
            <span className="font-display text-2xl whitespace-nowrap">{b.minutes}<span className="label ml-1">min</span></span>
          </li>
        ))}
      </ul>
    </div>
  )
}
