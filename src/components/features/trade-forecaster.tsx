import { InjuryBadge } from '#/components/features/player-row'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useScheduleQuery } from '#/hooks/use-fantasy-queries'

function formatKickoff(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function TradeForecaster() {
  const { data, isLoading, error } = useScheduleQuery(3)

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
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-tight">
          Schedule & Trade Forecaster
        </h2>
        <p className="mt-1 max-w-2xl text-[var(--muted)]">
          Week {matrix?.week ?? 1} NFL matrix mapped to league managers —
          injury tags, CEL alerts, and leverage correlations.
        </p>
      </div>

      {bye ? (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle>Bye-week crunch · Week {bye.targetWeek}</CardTitle>
            <CardDescription>{bye.notes}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {bye.affectedUserPlayers.map((player) => (
              <Badge key={player.playerKey} variant="injuryO">
                {player.name} ({player.position})
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {matrix?.games.map((game) => (
          <Card
            key={game.id}
            className={
              game.leverageFlag?.active ? 'border-fuchsia-500/35' : undefined
            }
          >
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {game.awayTeam} @ {game.homeTeam}
                </CardTitle>
                <span className="text-xs text-[var(--muted)]">
                  {formatKickoff(game.kickoffET)}
                </span>
              </div>
              {game.leverageFlag?.active ? (
                <CardDescription className="text-fuchsia-200/90">
                  <Badge variant="leverage" className="mr-2">
                    {game.leverageFlag.type.replaceAll('_', ' ')}
                  </Badge>
                  {game.leverageFlag.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {game.fantasyRelevance.map((player) => {
                  const isUser = player.managerId === 'grok_bowers'
                  const isOpp = player.managerId === 'marianne_team'
                  return (
                    <div
                      key={`${game.id}-${player.playerKey}`}
                      className={`flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm ${
                        isUser
                          ? 'bg-[var(--accent-soft)]'
                          : isOpp
                            ? 'bg-fuchsia-500/10'
                            : 'bg-[var(--panel-elevated)]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{player.name}</p>
                          <InjuryBadge status={player.status} />
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {player.team} {player.position} · {player.managerId}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
