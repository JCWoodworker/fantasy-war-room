import { useQuery } from '@tanstack/react-query'

import {
  getHealth,
  getMatchup,
  getRoster,
  getSchedule,
  getStandings,
  getWaivers,
} from '#/lib/api'
import { useWarRoomStore } from '#/stores/war-room-store'

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 30_000,
  })
}

export function useMatchupQuery(week?: number) {
  const teamId = useWarRoomStore((s) => s.activeTeamId)
  return useQuery({
    queryKey: ['matchup', teamId, week ?? 'current'],
    queryFn: () => getMatchup(teamId, week),
    refetchInterval: 60_000,
  })
}

export function useRosterQuery(week?: number) {
  const teamId = useWarRoomStore((s) => s.activeTeamId)
  return useQuery({
    queryKey: ['roster', teamId, week ?? 'current'],
    queryFn: () => getRoster(teamId, week),
  })
}

export function useWaiversQuery(position?: string, systems?: string[]) {
  const teamId = useWarRoomStore((s) => s.activeTeamId)
  return useQuery({
    queryKey: [
      'waivers',
      teamId,
      position ?? 'all',
      systems?.join(',') ?? 'all',
    ],
    queryFn: () => getWaivers(teamId, { position, systems }),
    refetchInterval: 120_000,
  })
}

export function useScheduleQuery(weeksAhead = 3) {
  const teamId = useWarRoomStore((s) => s.activeTeamId)
  return useQuery({
    queryKey: ['schedule', teamId, weeksAhead],
    queryFn: () => getSchedule(teamId, weeksAhead),
  })
}

export function useStandingsQuery() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: getStandings,
  })
}
