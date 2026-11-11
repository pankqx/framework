import { Fragment } from 'react'

/**
 * Japanese text with optional furigana. Content marks readings as {漢字|かんじ};
 * with `furigana` off the reading is dropped and only the kanji shows.
 */
export function JP({ text, furigana = true, className = '' }: { text: string; furigana?: boolean; className?: string }) {
  const parts = text.split(/(\{[^|{}]+\|[^|{}]+\})/g)
  return (
    <span lang="ja" className={`font-jp ${className}`}>
      {parts.map((part, i) => {
        const m = /^\{([^|]+)\|([^}]+)\}$/.exec(part)
        if (!m) return <Fragment key={i}>{part}</Fragment>
        return furigana ? (
          <ruby key={i}>
            {m[1]}
            <rt className="text-[0.5em] font-normal tracking-normal text-soft">{m[2]}</rt>
          </ruby>
        ) : (
          <Fragment key={i}>{m[1]}</Fragment>
        )
      })}
    </span>
  )
}

/** Plain text of a furigana-marked string: kanji form, or the kana reading. */
export const plain = (text: string, form: 'kanji' | 'kana' = 'kanji') =>
  text.replace(/\{([^|{}]+)\|([^|{}]+)\}/g, (_, k: string, r: string) => (form === 'kanji' ? k : r))
