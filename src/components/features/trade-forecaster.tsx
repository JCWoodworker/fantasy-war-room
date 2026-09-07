import { Badge } from '#/components/ui/badge'
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
import { useScheduleQuery } from '#/hooks/use-fantasy-queries'

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

  const players = [...new Set(data.myPlayers.map((c) => c.playerName))]
  const lookaheadWeeks = data.weeks

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-tight">
          Schedule & Trade Forecaster
        </h2>
        <p className="mt-1 max-w-2xl text-[var(--muted)]">
          Three-week lookahead, bye crunches, and buy-low targets on soft
          schedules.
        </p>
      </div>

      {data.byeOverlapWeeks.length > 0 ? (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle>Bye-week crunch alert</CardTitle>
            <CardDescription>
              Overlapping byes on your roster — especially Week 11
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.byeOverlapWeeks.map((week) => (
              <Badge key={week} variant="injuryO">
                Week {week} overlap
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Lookahead matrix</CardTitle>
          <CardDescription>Weeks {lookaheadWeeks.join(' · ')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                {lookaheadWeeks.map((week) => (
                  <TableHead key={week}>W{week}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players
                .filter((name) =>
                  data.myPlayers.some(
                    (c) => c.playerName === name && lookaheadWeeks.includes(c.week),
                  ),
                )
                .map((name) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    {lookaheadWeeks.map((week) => {
                      const cell = data.myPlayers.find(
                        (c) => c.playerName === name && c.week === week,
                      )
                      if (!cell) {
                        return <TableCell key={week}>—</TableCell>
                      }
                      if (cell.isBye) {
                        return (
                          <TableCell key={week}>
                            <Badge variant="injuryO">BYE</Badge>
                          </TableCell>
                        )
                      }
                      return (
                        <TableCell key={week}>
                          <span
                            className={
                              cell.softSchedule
                                ? 'text-emerald-300'
                                : 'text-[var(--fg)]'
                            }
                          >
                            {cell.opponent}
                          </span>
                          {cell.opponentDefRank ? (
                            <span className="ml-1 text-xs text-[var(--muted)]">
                              D{cell.opponentDefRank}
                            </span>
                          ) : null}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buy-low targets</CardTitle>
          <CardDescription>
            Underperforming players with soft DEF ranks ahead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.buyLowTargets.map((target) => (
            <div
              key={target.player.playerKey}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{target.player.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    On {target.teamName} · {target.player.nflTeam}{' '}
                    {target.player.position}
                  </p>
                </div>
                <Badge variant="positive">
                  Soft: W{target.softWeeksAhead.join(', W')}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{target.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
