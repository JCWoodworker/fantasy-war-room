import { cn } from '#/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function StatStrip({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: 'accent' | 'up' | 'down' | 'default' }>
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="surface-accent rounded-xl border border-[var(--border)] px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            {item.label}
          </p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold tabular-nums sm:text-3xl',
              item.tone === 'accent' && 'text-[var(--accent)]',
              item.tone === 'up' && 'text-emerald-300',
              item.tone === 'down' && 'text-red-300',
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <div
      role="tablist"
      className="grid w-full grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-black p-1 sm:w-auto sm:inline-grid"
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-h-10 rounded-lg px-3 text-sm font-medium transition-colors',
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
