import { PlayerRow } from '#/components/features/player-row'
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
  const pool = [...data.freeAgents, ...data.waiverPlayers].filter((player) =>
    filterActive
      ? selectedSystemFilters.includes(player.nflTeam)
      : true,
  )

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Waiver Radar</h2>
          <p className="mt-1 max-w-2xl text-[var(--muted)]">
            Stash handcuffs and block opponents — filter by offensive system, not
            just projected points.
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
          <CardDescription>High-value backfields to monitor</CardDescription>
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

      {data.handcuffBlocks.length > 0 ? (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle>Handcuff / block opportunities</CardTitle>
            <CardDescription>
              Opponent injuries crossed with available backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.handcuffBlocks.map((block) => (
              <div
                key={`${block.injuredPlayer.playerKey}-${block.backup.playerKey}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="injuryD">{block.injuredPlayer.injuryStatus}</Badge>
                  <p className="text-sm font-medium">{block.reason}</p>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <PlayerRow player={block.injuredPlayer} />
                  <PlayerRow player={block.backup} />
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => simulateClaim(block.backup.playerKey)}
                >
                  {simulatedClaims.includes(block.backup.playerKey)
                    ? 'Sim claimed'
                    : 'Simulate claim'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Available pool</CardTitle>
          <CardDescription>
            {filterActive
              ? `Filtered to ${selectedSystemFilters.join(', ')}`
              : 'Free agents + waivers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Proj</TableHead>
                <TableHead>Owned</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pool.map((player) => (
                <TableRow
                  key={player.playerKey}
                  className={
                    simulatedClaims.includes(player.playerKey)
                      ? 'bg-[var(--accent-soft)]'
                      : undefined
                  }
                >
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.nflTeam}</TableCell>
                  <TableCell className="tabular-nums">
                    {player.projectedPoints.toFixed(1)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {player.percentOwned ?? '—'}%
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => simulateClaim(player.playerKey)}
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
