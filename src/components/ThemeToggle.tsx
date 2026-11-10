import { useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className="label flex h-11 items-center gap-2 px-1 hover:text-red"
      aria-label={`Switch to ${next} theme`}
      onClick={() => {
        document.documentElement.dataset.theme = next
        try {
          localStorage.setItem('kotoba:theme', next)
        } catch {
          /* theme just won't persist */
        }
        setTheme(next)
      }}
    >
      <span aria-hidden className="font-jp text-base">{theme === 'dark' ? '昼' : '夜'}</span>
      {next}
    </button>
  )
}
