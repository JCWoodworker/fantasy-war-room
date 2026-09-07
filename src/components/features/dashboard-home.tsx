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

const tiles = [
  {
    to: '/matchup',
    title: 'Matchup Exploiter',
    blurb: 'Positional edges and leverage flags for this week.',
    icon: Crosshair,
  },
  {
    to: '/waivers',
    title: 'Waiver Radar',
    blurb: 'Handcuff blocks from opponent injuries.',
    icon: Radar,
  },
  {
    to: '/schedule',
    title: 'Trade Forecaster',
    blurb: 'Bye crunches and soft-schedule buy-lows.',
    icon: CalendarRange,
  },
] as const

export function DashboardHome() {
  const health = useHealthQuery()
  const matchup = useMatchupQuery()
  const standings = useStandingsQuery()

  const edge =
    matchup.data != null
      ? matchup.data.myTeam.projectedTotal - matchup.data.opponent.projectedTotal
      : null

  return (
    <div className="animate-fade-up space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-10 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,245,66,0.18),transparent_40%)]" />
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          The Grok Bowers War Room
        </p>
        <h2 className="font-display mt-3 max-w-xl text-4xl leading-none text-[var(--fg)] lg:text-5xl">
          High-upside management, zero mercy.
        </h2>
        <p className="mt-4 max-w-lg text-[var(--muted)]">
          Situational leverage over static projections — matchups, handcuffs, and
          schedule edges in one board.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary">Mode: {health.data?.mode ?? 'mock'}</Badge>
          {matchup.data ? (
            <Badge variant={edge != null && edge >= 0 ? 'positive' : 'negative'}>
              Week {matchup.data.week} edge{' '}
              {edge != null ? `${edge >= 0 ? '+' : ''}${edge.toFixed(1)}` : '—'}
            </Badge>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map(({ to, title, blurb, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-transform group-hover:-translate-y-0.5">
              <CardHeader>
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
          <CardTitle>Standings snapshot</CardTitle>
          <CardDescription>League table from Nest / mock feed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {standings.data?.standings.map((row) => (
            <div
              key={row.teamKey}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-[var(--muted)]">#{row.rank}</span>
                <span className="font-medium">{row.name}</span>
              </div>
              <span className="tabular-nums text-[var(--muted)]">
                {row.wins}-{row.losses}
                {row.ties ? `-${row.ties}` : ''} · {row.pointsFor.toFixed(1)} PF
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
