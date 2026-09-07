import { Link, useRouterState } from '@tanstack/react-router'
import {
  Crosshair,
  LayoutDashboard,
  Radar,
  CalendarRange,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useHealthQuery } from '#/hooks/use-fantasy-queries'
import { cn } from '#/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/matchup', label: 'Matchup Exploiter', icon: Crosshair },
  { to: '/waivers', label: 'Waiver Radar', icon: Radar },
  { to: '/schedule', label: 'Trade Forecaster', icon: CalendarRange },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const health = useHealthQuery()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-md transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              High-upside ops
            </p>
            <h1 className="font-display mt-2 text-2xl leading-none text-[var(--accent)]">
              Grok Bowers
              <span className="mt-1 block text-[var(--fg)]">War Room</span>
            </h1>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--muted)] hover:bg-[var(--panel-elevated)] hover:text-[var(--fg)]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Data mode</span>
              <Badge variant="secondary">
                {health.data?.mode ?? 'mock'}
              </Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              Nest proxy + Yahoo MCP. Mock payloads until OAuth is live.
            </p>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-4 py-3 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <p className="font-display text-sm tracking-wide text-[var(--muted)] lg:text-base">
            Ruthless leverage dashboard
          </p>
          <Badge
            variant={health.data?.mcpConnected ? 'positive' : 'secondary'}
            className="animate-pulse-soft"
          >
            {health.data?.mcpConnected ? 'MCP live' : 'MCP idle'}
          </Badge>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
