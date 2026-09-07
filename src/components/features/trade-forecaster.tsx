import { InjuryBadge } from '#/components/features/player-row'
import { PageHeader } from '#/components/layout/page-chrome'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  useMatchupQuery,
  useScheduleQuery,
} from '#/hooks/use-fantasy-queries'
import { useWarRoomStore } from '#/stores/war-room-store'
import { cn } from '#/lib/utils'

function formatKickoff(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function TradeForecaster() {
  const { data, isLoading, error } = useScheduleQuery(3)
  const matchup = useMatchupQuery()
  const activeTeamId = useWarRoomStore((s) => s.activeTeamId)
  const opponentTeamKey = matchup.data?.opponent.teamKey

  if (isLoading) {
    return <p className="text-[var(--muted)]">Building schedule matrix…</p>
  }
  if (error || !data) {
    return (
      <p className="text-[var(--danger)]">
        Failed to load schedule. {error instanceof Error ? error.message : ''}
      </p>
    )
  }

  const matrix = data.scheduleMatrix
  const bye = data.byeLookahead

  return (
    <div className="animate-fade-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Schedule Matrix"
        description={`Week ${matrix?.week ?? 1} slate for your matchup — your players highlighted, opponent in fuchsia, leverage only for the team you’re viewing.`}
      />

      {bye ? (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle>Bye crunch · Week {bye.targetWeek}</CardTitle>
            <CardDescription className="text-pretty">{bye.notes}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chip-scroll">
              {bye.affectedUserPlayers.map((player) => (
                <Badge
                  key={player.playerKey}
                  variant="injuryO"
                  className="shrink-0"
                >
                  {player.name} ({player.position})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3 sm:space-y-4">
        {matrix?.games.map((game) => {
          const leverageForActive =
            game.leverageFlag?.active &&
            game.leverageFlag.forManagerId === activeTeamId
              ? game.leverageFlag
              : null

          return (
          <Card
            key={game.id}
            className={cn(leverageForActive && 'border-fuchsia-500/35')}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <CardTitle className="text-base sm:text-lg">
                  {game.awayTeam}{' '}
                  <span className="text-[var(--muted)]">@</span> {game.homeTeam}
                </CardTitle>
                <span className="text-xs text-[var(--muted)] sm:text-right">
                  {formatKickoff(game.kickoffET)}
                </span>
              </div>
              {leverageForActive ? (
                <CardDescription className="text-pretty text-fuchsia-200/90">
                  <Badge variant="leverage" className="mb-2 mr-0 sm:mb-0 sm:mr-2">
                    {leverageForActive.type.replaceAll('_', ' ')}
                  </Badge>
                  <span className="mt-1 block sm:mt-0 sm:inline">
                    {leverageForActive.description}
                  </span>
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {game.fantasyRelevance.map((player) => {
                  const isUser = player.managerId === activeTeamId
                  const isOpp =
                    opponentTeamKey != null &&
                    player.managerId === opponentTeamKey
                  return (
                    <div
                      key={`${game.id}-${player.playerKey}`}
                      className={cn(
                        'flex min-h-12 items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm',
                        isUser && 'bg-[var(--accent-soft)]',
                        isOpp && 'bg-fuchsia-500/10',
                        !isUser && !isOpp && 'bg-[var(--panel-elevated)]',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate font-medium">{player.name}</p>
                          <InjuryBadge status={player.status} />
                        </div>
                        <p className="truncate text-[11px] text-[var(--muted)]">
                          {player.team} {player.position} · {player.managerId}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
