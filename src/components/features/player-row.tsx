import type { InjuryStatus, Player } from '#/types/yahoo'
import { Badge } from '#/components/ui/badge'

export function InjuryBadge({ status }: { status: InjuryStatus }) {
  if (!status) return null
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
  onToggle,
}: {
  player: Player
  highlighted?: boolean
  onToggle?: () => void
}) {
  return (
    <div
      className={`grid grid-cols-[48px_1fr_auto] items-center gap-2 rounded-lg px-2 py-2 ${
        highlighted ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--panel-elevated)]'
      }`}
    >
      <span className="text-xs font-semibold text-[var(--muted)]">
        {player.selectedPosition}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{player.name}</p>
          <InjuryBadge status={player.injuryStatus} />
        </div>
        <p className="text-xs text-[var(--muted)]">
          {player.nflTeam}
          {player.opponent ? ` · ${player.opponent}` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">
          {player.projectedPoints.toFixed(1)}
        </p>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="text-[10px] uppercase tracking-wide text-[var(--accent)]"
          >
            sim
          </button>
        ) : null}
      </div>
    </div>
  )
}
