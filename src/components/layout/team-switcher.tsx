import { MANAGED_TEAMS, useWarRoomStore } from '#/stores/war-room-store'
import { cn } from '#/lib/utils'

export function TeamSwitcher({ compact = false }: { compact?: boolean }) {
  const activeTeamId = useWarRoomStore((s) => s.activeTeamId)
  const setActiveTeamId = useWarRoomStore((s) => s.setActiveTeamId)

  return (
    <div
      role="group"
      aria-label="Select managed team"
      className={cn(
        'inline-flex max-w-full items-center gap-0.5 rounded-lg border border-[var(--border)] bg-black p-0.5',
        compact ? 'w-full sm:w-auto' : '',
      )}
    >
      {MANAGED_TEAMS.map((team) => {
        const active = activeTeamId === team.id
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => setActiveTeamId(team.id)}
            className={cn(
              'min-h-9 flex-1 rounded-md px-2.5 text-xs font-semibold transition-colors sm:flex-none sm:px-3 sm:text-sm',
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]',
            )}
          >
            <span className="sm:hidden">{team.shortLabel}</span>
            <span className="hidden sm:inline">
              {team.shortLabel}
              <span className="font-normal text-[var(--muted)]">
                {' '}
                · {team.teamName}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
