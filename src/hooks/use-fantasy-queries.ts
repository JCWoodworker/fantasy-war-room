import { useQuery } from '@tanstack/react-query'

import {
  getHealth,
  getMatchup,
  getRoster,
  getSchedule,
  getStandings,
  getWaivers,
} from '#/lib/api'

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 30_000,
  })
}

export function useMatchupQuery(week?: number) {
  return useQuery({
    queryKey: ['matchup', week ?? 'current'],
    queryFn: () => getMatchup(week),
    refetchInterval: 60_000,
  })
}

export function useRosterQuery(teamKey?: string, week?: number) {
  return useQuery({
    queryKey: ['roster', teamKey ?? 'me', week ?? 'current'],
    queryFn: () => getRoster(teamKey, week),
  })
}

export function useWaiversQuery(position?: string, systems?: string[]) {
  return useQuery({
    queryKey: ['waivers', position ?? 'all', systems?.join(',') ?? 'all'],
    queryFn: () => getWaivers({ position, systems }),
    refetchInterval: 120_000,
  })
}

export function useScheduleQuery(weeksAhead = 3) {
  return useQuery({
    queryKey: ['schedule', weeksAhead],
    queryFn: () => getSchedule(weeksAhead),
  })
}

export function useStandingsQuery() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: getStandings,
  })
}
