import { InjuryBadge, PlayerRow } from '#/components/features/player-row'
import { PageHeader } from '#/components/layout/page-chrome'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useMatchupQuery, useWaiversQuery } from '#/hooks/use-fantasy-queries'
import { useWarRoomStore } from '#/stores/war-room-store'
import { cn } from '#/lib/utils'

function priorityVariant(priority: string) {
  if (priority === 'HIGH') return 'priorityHigh' as const
  if (priority === 'MEDIUM') return 'priorityMed' as const
  return 'priorityLow' as const
}

export function WaiverRadar() {
  const { data, isLoading, error } = useWaiversQuery()
  const matchup = useMatchupQuery()
  const activeTeamId = useWarRoomStore((s) => s.activeTeamId)
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
  const oppLabel =
    matchup.data?.opponent.managerName ??
    matchup.data?.opponent.name ??
    "this week's opponent"

  return (
    <div className="animate-fade-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Waiver Radar"
        description={
          activeTeamId === 'two_pint_conversion'
            ? `Flex Diggs vs Pittman (Q); watch ${oppLabel}'s Nabers/Warren injury traps.`
            : `Block ${oppLabel}'s handcuffs and stash system backups before Sunday.`
        }
        actions={
          simulatedClaims.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={clearSimulatedClaims}>
              Clear {simulatedClaims.length} sim
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Targeted systems</CardTitle>
          <CardDescription>Filter blocks by NFL offense</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="chip-scroll">
            {systems.map((system) => {
              const active = selectedSystemFilters.includes(system)
              return (
                <button
                  key={system}
                  type="button"
                  onClick={() => toggleSystemFilter(system)}
                  className={cn(
                    'min-h-10 shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--muted)]',
                  )}
                >
                  {system}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {blocks.map((block) => (
          <Card key={block.playerKey} className="border-amber-500/20">
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={priorityVariant(block.priority)}>
                  {block.priority}
                </Badge>
                <p className="text-base font-medium">
                  {block.targetPlayer}
                  <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                    {block.nflTeam} {block.position}
                  </span>
                </p>
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {block.rationale}
              </p>
              <Button
                size="sm"
                className="min-h-10 w-full sm:w-auto"
                onClick={() => simulateClaim(block.playerKey)}
              >
                {simulatedClaims.includes(block.playerKey)
                  ? 'Sim claimed'
                  : 'Simulate claim'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                  <InjuryBadge status={block.injuredPlayer.injuryStatus} />
                  <span className="text-[var(--muted)]">
                    {block.injuredOnTeamName}
                  </span>
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

      {/* Mobile-friendly list instead of wide table */}
      <Card>
        <CardHeader>
          <CardTitle>Available pool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {blocks.map((block) => (
            <div
              key={`pool-${block.playerKey}`}
              className={cn(
                'flex flex-col gap-3 rounded-lg border border-[var(--border)] p-3 sm:flex-row sm:items-center sm:justify-between',
                simulatedClaims.includes(block.playerKey) &&
                  'bg-[var(--accent-soft)]',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{block.targetPlayer}</p>
                  <Badge variant={priorityVariant(block.priority)}>
                    {block.priority}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {block.position} · {block.nflTeam}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="min-h-10 w-full sm:w-auto"
                onClick={() => simulateClaim(block.playerKey)}
              >
                Claim
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
