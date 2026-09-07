import { MANAGED_TEAMS, useWarRoomStore } from '#/stores/war-room-store'
import { cn } from '#/lib/utils'

type TeamSwitcherProps = {
  /** Vertical stack for narrow sidebar columns */
  stacked?: boolean
  className?: string
}

export function TeamSwitcher({ stacked = false, className }: TeamSwitcherProps) {
  const activeTeamId = useWarRoomStore((s) => s.activeTeamId)
  const setActiveTeamId = useWarRoomStore((s) => s.setActiveTeamId)

  return (
    <div
      role="group"
      aria-label="Select managed team"
      className={cn(
        'rounded-lg border border-[var(--border)] bg-black p-0.5',
        stacked
          ? 'flex w-full flex-col gap-0.5'
          : 'inline-flex w-full max-w-full items-center gap-0.5 sm:w-auto',
        className,
      )}
    >
      {MANAGED_TEAMS.map((team) => {
        const active = activeTeamId === team.id
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => setActiveTeamId(team.id)}
            title={`${team.ownerName} · ${team.teamName}`}
            className={cn(
              'min-h-9 rounded-md px-2.5 text-left text-xs font-semibold transition-colors sm:text-sm',
              stacked ? 'w-full' : 'min-w-0 flex-1 truncate sm:flex-none',
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]',
            )}
          >
            <span className="block truncate">{team.shortLabel}</span>
            {stacked ? (
              <span className="block truncate text-[10px] font-normal text-[var(--muted)]">
                {team.teamName}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
