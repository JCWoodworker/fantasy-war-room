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
    blurb: 'Week 1 vs Marianne — Nix/Harvey vs Broncos DEF leverage.',
    icon: Crosshair,
  },
  {
    to: '/waivers',
    title: 'Waiver Radar',
    blurb: 'Guerendo, Benson, Conklin blocks before Sunday.',
    icon: Radar,
  },
  {
    to: '/schedule',
    title: 'Trade Forecaster',
    blurb: 'Full Week 1 NFL matrix with league ownership tags.',
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
          {health.data?.leagueName ?? 'Fantasy Football League 2026'}
        </p>
        <h2 className="font-display mt-3 max-w-xl text-4xl leading-none text-[var(--fg)] lg:text-5xl">
          Grok Bowers · Week {matchup.data?.week ?? 1}
        </h2>
        <p className="mt-4 max-w-lg text-[var(--muted)]">
          Corey vs Marianne — real league mock until Yahoo API access clears.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary">Mode: {health.data?.mode ?? 'mock'}</Badge>
          {matchup.data ? (
            <Badge variant={edge != null && edge >= 0 ? 'positive' : 'negative'}>
              Edge{' '}
              {edge != null ? `${edge >= 0 ? '+' : ''}${edge.toFixed(2)}` : '—'}{' '}
              vs {matchup.data.opponent.name}
            </Badge>
          ) : null}
          {matchup.data?.leverageFlags[0] ? (
            <Badge variant="leverage">Leverage live</Badge>
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
          <CardTitle>Projected standings</CardTitle>
          <CardDescription>
            Preseason Yahoo projections · 0-0 until kickoff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {standings.data?.standings.map((row) => (
            <div
              key={row.teamKey}
              className={`flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm ${
                row.teamKey === 'grok_bowers' ? 'bg-[var(--accent-soft)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-[var(--muted)]">#{row.rank}</span>
                <div>
                  <span className="font-medium">{row.name}</span>
                  {row.ownerName ? (
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {row.ownerName}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="tabular-nums text-[var(--muted)]">
                {row.projectedRecord ?? `${row.wins}-${row.losses}`}
                {row.projectedSeasonPoints != null
                  ? ` · ${row.projectedSeasonPoints.toFixed(1)} proj`
                  : ''}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
