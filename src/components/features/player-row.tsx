import type { InjuryStatus, Player } from '#/types/yahoo'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

/** CEL is ineligible like Out — zero stats, locks the roster spot. */
export function isScoringIneligible(status: InjuryStatus): boolean {
  return status === 'O' || status === 'IR' || status === 'CEL'
}

export function InjuryBadge({ status }: { status: InjuryStatus }) {
  if (!status) return null
  if (status === 'CEL') {
    return (
      <Badge variant="injuryCEL" title="Commissioner's Exempt List — ineligible">
        CEL
      </Badge>
    )
  }
  const variant =
    status === 'O' || status === 'IR'
      ? 'injuryO'
      : status === 'D'
        ? 'injuryD'
        : 'injuryQ'
  return <Badge variant={variant}>{status}</Badge>
}

export function PlayerRow({
  player,
  highlighted,
}: {
  player: Player
  highlighted?: boolean
}) {
  const ineligible = isScoringIneligible(player.injuryStatus)
  return (
    <div
      className={cn(
        'grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2.5 sm:gap-3 sm:px-2.5',
        highlighted && 'bg-[var(--accent-soft)]',
        ineligible && !highlighted && 'bg-red-950/25 opacity-85',
        !highlighted && !ineligible && 'hover:bg-[var(--panel-elevated)]',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-xs">
        {player.selectedPosition}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium sm:text-[15px]">
            {player.name}
          </p>
          <InjuryBadge status={player.injuryStatus} />
        </div>
        <p className="truncate text-[11px] text-[var(--muted)] sm:text-xs">
          {player.nflTeam}
          {player.opponent ? ` · ${player.opponent}` : ''}
          {player.gameTime ? ` · ${player.gameTime}` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums sm:text-base">
          {player.projectedPoints.toFixed(1)}
        </p>
      </div>
    </div>
  )
}
