import { useId } from 'react'

export interface ChoiceOption<T extends string | number> {
  value: T
  label: string
  hint?: string
  jp?: string
}

/** A radio group drawn as editorial rows. Real radio inputs keep it keyboard and screen-reader friendly. */
export function Choice<T extends string | number>({
  legend,
  options,
  value,
  onChange,
  columns = 1,
}: {
  legend: string
  options: ChoiceOption<T>[]
  value: T | null
  onChange: (value: T) => void
  columns?: 1 | 2
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className="label mb-3 text-soft">{legend}</legend>
      <div className={`grid gap-px border border-line bg-line ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {options.map((o) => {
          const checked = o.value === value
          return (
            <label
              key={String(o.value)}
              className={`flex min-h-14 cursor-pointer items-center gap-4 px-4 py-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue ${checked ? 'bg-ink text-paper' : 'bg-paper hover:bg-muted'}`}
            >
              <input type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(o.value)} />
              {o.jp && <span lang="ja" className="w-9 shrink-0 font-jp-serif text-2xl font-black">{o.jp}</span>}
              <span>
                <span className="block font-medium">{o.label}</span>
                {o.hint && <span className={`block text-sm ${checked ? 'opacity-70' : 'text-soft'}`}>{o.hint}</span>}
              </span>
              <span aria-hidden className={`ml-auto h-2.5 w-2.5 shrink-0 rounded-full ${checked ? 'bg-red' : 'border border-line'}`} />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
