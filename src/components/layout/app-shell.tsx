import { Link, useRouterState } from '@tanstack/react-router'
import {
  Crosshair,
  LayoutDashboard,
  Radar,
  CalendarRange,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useHealthQuery } from '#/hooks/use-fantasy-queries'
import { cn } from '#/lib/utils'

const navItems = [
  { to: '/', label: 'Home', short: 'Home', icon: LayoutDashboard },
  { to: '/matchup', label: 'Matchup', short: 'Matchup', icon: Crosshair },
  { to: '/waivers', label: 'Waivers', short: 'Waivers', icon: Radar },
  { to: '/schedule', label: 'Schedule', short: 'Schedule', icon: CalendarRange },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const health = useHealthQuery()

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const pageTitle =
    navItems.find((item) => item.to === pathname)?.label ?? 'War Room'

  return (
    <div className="min-h-dvh bg-black text-[var(--fg)] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-[var(--border)] bg-[var(--panel)] lg:flex">
        <div className="flex h-full flex-col p-5">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
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
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--muted)] hover:bg-[var(--panel-elevated)] hover:text-[var(--fg)]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto space-y-2 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Data mode</span>
              <Badge variant="secondary">{health.data?.mode ?? 'mock'}</Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              League mock until Yahoo OAuth clears.
            </p>
          </div>
        </div>
      </aside>

      {/* Tablet drawer (md–lg) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-200 lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 pt-[max(0.75rem,var(--safe-top))]">
          <p className="font-display text-sm text-[var(--accent)]">Grok Bowers</p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--muted)]',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header
          className="sticky top-0 z-30 flex min-h-[var(--header-h)] items-center gap-3 border-b border-[var(--border)] bg-black/90 px-3 backdrop-blur-md sm:px-5 lg:px-8"
          style={{ paddingTop: 'var(--safe-top)' }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm tracking-wide text-[var(--fg)] sm:text-base">
              <span className="text-[var(--accent)] lg:hidden">GB </span>
              <span className="lg:hidden">{pageTitle}</span>
              <span className="hidden text-[var(--muted)] lg:inline">
                Ruthless leverage dashboard
              </span>
            </p>
          </div>
          <Badge
            variant={health.data?.mcpConnected ? 'positive' : 'secondary'}
            className="shrink-0 animate-pulse-soft"
          >
            {health.data?.mode ?? 'mock'}
          </Badge>
        </header>

        <main
          className={cn(
            'mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8',
            // room for bottom tab bar on phones
            'pb-[calc(var(--nav-h)+var(--safe-bottom)+0.75rem)] lg:pb-8',
          )}
        >
          {children}
        </main>

        {/* Mobile / tablet bottom tabs */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-black/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          <ul className="mx-auto grid h-[var(--nav-h)] max-w-lg grid-cols-4">
            {navItems.map(({ to, short, icon: Icon }) => {
              const active = pathname === to
              return (
                <li key={to} className="min-w-0">
                  <Link
                    to={to}
                    className={cn(
                      'flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium sm:text-xs',
                      active ? 'text-[var(--accent)]' : 'text-[var(--muted)]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        active && 'bg-[var(--accent-soft)]',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{short}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
