import { Link } from '@tanstack/react-router'
import { Crosshair, Radar, CalendarRange } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  useHealthQuery,
  useMatchupQuery,
  useStandingsQuery,
} from '#/hooks/use-fantasy-queries'
import { getManagedTeam, useWarRoomStore } from '#/stores/war-room-store'

export function DashboardHome() {
  const health = useHealthQuery()
  const matchup = useMatchupQuery()
  const standings = useStandingsQuery()
  const activeTeamId = useWarRoomStore((s) => s.activeTeamId)
  const activeTeam = getManagedTeam(activeTeamId)

  const edge =
    matchup.data != null
      ? matchup.data.myTeam.projectedTotal - matchup.data.opponent.projectedTotal
      : null

  const oppName =
    matchup.data?.opponent.managerName ?? matchup.data?.opponent.name ?? 'opponent'
  const oppTeam = matchup.data?.opponent.name

  const tiles = [
    {
      to: '/matchup' as const,
      title: 'Matchup Exploiter',
      blurb: matchup.data
        ? `Week ${matchup.data.week} vs ${oppName} — projected edge live.`
        : 'Load matchup leverage and lineup edges.',
      icon: Crosshair,
    },
    {
      to: '/waivers' as const,
      title: 'Waiver Radar',
      blurb:
        activeTeamId === 'two_pint_conversion'
          ? 'Flex Diggs vs Pittman and watch Nabers/Warren.'
          : 'Block handcuffs and stash system backups.',
      icon: Radar,
    },
    {
      to: '/schedule' as const,
      title: 'Schedule Matrix',
      blurb: 'Your matchup’s NFL slate — no other managers.',
      icon: CalendarRange,
    },
  ]

  return (
    <div className="animate-fade-up space-y-5 sm:space-y-8">
      <section className="surface-accent relative overflow-hidden rounded-2xl border border-[var(--border)] px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:text-xs">
          {health.data?.leagueName ?? 'Fantasy Football League 2026'}
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl leading-[0.95] text-[var(--fg)] sm:text-4xl lg:text-5xl">
          <span className="text-[var(--accent)]">{activeTeam.teamName}</span>
          <span className="mt-1 block text-[var(--fg)]">
            Week {matchup.data?.week ?? 1}
          </span>
        </h2>
        <p className="mt-3 max-w-lg text-sm text-[var(--muted)] sm:mt-4 sm:text-base">
          {activeTeam.ownerName}
          {oppTeam ? ` vs ${oppName}` : ''} — league mock until Yahoo API access
          clears.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary">Mode: {health.data?.mode ?? 'mock'}</Badge>
          {matchup.data ? (
            <Badge variant={edge != null && edge >= 0 ? 'positive' : 'negative'}>
              Edge{' '}
              {edge != null ? `${edge >= 0 ? '+' : ''}${edge.toFixed(2)}` : '—'}
            </Badge>
          ) : null}
          {matchup.data?.leverageFlags[0] ? (
            <Badge variant="leverage">Leverage live</Badge>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {tiles.map(({ to, title, blurb, icon: Icon }) => (
          <Link key={to} to={to} className="group block min-h-11">
            <Card className="h-full transition-transform active:scale-[0.99] group-hover:-translate-y-0.5">
              <CardHeader className="surface-accent-strong rounded-xl">
                <Icon className="mb-2 h-5 w-5 text-[var(--accent)]" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{blurb}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projected standings</CardTitle>
          <CardDescription>
            Preseason projections · 0-0 until kickoff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {standings.data?.standings.map((row) => (
            <div
              key={row.teamKey}
              className={`flex flex-col gap-1 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between ${
                row.teamKey === activeTeamId ? 'bg-[var(--accent-soft)]' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-[var(--muted)]">
                  #{row.rank}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name}</p>
                  {row.ownerName ? (
                    <p className="text-xs text-[var(--muted)]">{row.ownerName}</p>
                  ) : null}
                </div>
              </div>
              <p className="pl-9 text-xs tabular-nums text-[var(--muted)] sm:pl-0 sm:text-sm">
                {row.projectedRecord ?? `${row.wins}-${row.losses}`}
                {row.projectedSeasonPoints != null
                  ? ` · ${row.projectedSeasonPoints.toFixed(1)} proj`
                  : ''}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
