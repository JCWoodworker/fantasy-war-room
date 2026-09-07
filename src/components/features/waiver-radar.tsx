import { InjuryBadge, PlayerRow } from '#/components/features/player-row'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useWaiversQuery } from '#/hooks/use-fantasy-queries'
import { useWarRoomStore } from '#/stores/war-room-store'
import { cn } from '#/lib/utils'

function priorityVariant(priority: string) {
  if (priority === 'HIGH') return 'priorityHigh' as const
  if (priority === 'MEDIUM') return 'priorityMed' as const
  return 'priorityLow' as const
}

export function WaiverRadar() {
  const { data, isLoading, error } = useWaiversQuery()
  const selectedSystemFilters = useWarRoomStore((s) => s.selectedSystemFilters)
  const toggleSystemFilter = useWarRoomStore((s) => s.toggleSystemFilter)
  const simulatedClaims = useWarRoomStore((s) => s.simulatedClaims)
  const simulateClaim = useWarRoomStore((s) => s.simulateClaim)
  const clearSimulatedClaims = useWarRoomStore((s) => s.clearSimulatedClaims)

  if (isLoading) {
    return <p className="text-[var(--muted)]">Scanning waiver wire…</p>
  }
  if (error || !data) {
    return (
      <p className="text-[var(--danger)]">
        Failed to load waivers. {error instanceof Error ? error.message : ''}
      </p>
    )
  }

  const systems = data.targetedSystems
  const filterActive = selectedSystemFilters.length > 0
  const blocks = data.recommendedBlocks.filter((block) =>
    filterActive ? selectedSystemFilters.includes(block.nflTeam) : true,
  )

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Waiver Radar</h2>
          <p className="mt-1 max-w-2xl text-[var(--muted)]">
            Block Marianne&apos;s handcuffs, corner Latino Heat&apos;s TE stream,
            and stash system backups — not pure projected-points sorting.
          </p>
        </div>
        {simulatedClaims.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={clearSimulatedClaims}>
            Clear {simulatedClaims.length} sim claim
            {simulatedClaims.length > 1 ? 's' : ''}
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Targeted systems</CardTitle>
          <CardDescription>NFL offenses tied to this week&apos;s blocks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {systems.map((system) => {
            const active = selectedSystemFilters.includes(system)
            return (
              <button
                key={system}
                type="button"
                onClick={() => toggleSystemFilter(system)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]',
                )}
              >
                {system}
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle>Recommended blocks</CardTitle>
          <CardDescription>
            Injury hedges + Latino Heat TE crisis stashes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blocks.map((block) => (
            <div
              key={block.playerKey}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={priorityVariant(block.priority)}>
                  {block.priority}
                </Badge>
                <p className="font-medium">
                  {block.targetPlayer}{' '}
                  <span className="text-[var(--muted)]">
                    · {block.nflTeam} {block.position}
                  </span>
                </p>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{block.rationale}</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => simulateClaim(block.playerKey)}
              >
                {simulatedClaims.includes(block.playerKey)
                  ? 'Sim claimed'
                  : 'Simulate claim'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {data.handcuffBlocks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Injury → backup map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.handcuffBlocks.map((block) => (
              <div
                key={`${block.injuredPlayer.playerKey}-${block.backup.playerKey}`}
                className="rounded-lg border border-[var(--border)] p-3"
              >
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <InjuryBadge status={block.injuredPlayer.injuryStatus} />
                  <span className="text-[var(--muted)]">{block.injuredOnTeamName}</span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <PlayerRow player={block.injuredPlayer} />
                  <PlayerRow player={block.backup} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Available pool</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow
                  key={block.playerKey}
                  className={
                    simulatedClaims.includes(block.playerKey)
                      ? 'bg-[var(--accent-soft)]'
                      : undefined
                  }
                >
                  <TableCell className="font-medium">{block.targetPlayer}</TableCell>
                  <TableCell>{block.position}</TableCell>
                  <TableCell>{block.nflTeam}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant(block.priority)}>
                      {block.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => simulateClaim(block.playerKey)}
                    >
                      Claim
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
