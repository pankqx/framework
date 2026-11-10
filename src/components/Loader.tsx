/**
 * Shown only while code or data is really loading (Suspense / pending queries).
 * It never holds the app back for the sake of the animation.
 */
export function Loader({ inline = false }: { inline?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${inline ? 'min-h-[60vh]' : 'fixed inset-0 z-50'} grid place-items-center bg-paper text-ink`}
    >
      <div className="flex items-end gap-5">
        <span aria-hidden className="ink-in font-jp-serif text-[7rem] leading-none font-black text-red">
          言
        </span>
        <div className="fade-up pb-3" style={{ animationDelay: '0.35s' }}>
          <p className="font-display text-2xl tracking-tight">KOTOBA</p>
          <p className="label mt-1 text-soft">Designed &amp; engineered with curiosity.</p>
        </div>
      </div>
      <span className="sr-only">Loading KOTOBA</span>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse bg-muted ${className}`} />
}
