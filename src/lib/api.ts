import {
  mockHealth,
  mockMatchup,
  mockRoster,
  mockSchedule,
  mockStandings,
  mockWaivers,
} from '#/data/league-mock'
import type { ManagedTeamId } from '#/stores/war-room-store'
import type {
  HealthResponse,
  MatchupResponse,
  RosterResponse,
  ScheduleResponse,
  StandingsResponse,
  WaiversResponse,
} from '#/types/yahoo'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3001/api/v1/subapps/fantasy-war-room'

export function useMockYahoo(): boolean {
  return import.meta.env.VITE_USE_MOCK_YAHOO !== 'false'
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function getHealth(): Promise<HealthResponse> {
  if (useMockYahoo()) return mockHealth()
  return fetchJson<HealthResponse>('/health')
}

export async function getMatchup(
  teamId: ManagedTeamId,
  week?: number,
): Promise<MatchupResponse> {
  if (useMockYahoo()) {
    const data = await mockMatchup(teamId)
    if (week) data.week = week
    return data
  }
  const params = new URLSearchParams({ teamId })
  if (week) params.set('week', String(week))
  return fetchJson<MatchupResponse>(`/matchup?${params}`)
}

export async function getRoster(
  teamId: ManagedTeamId,
  week?: number,
): Promise<RosterResponse> {
  if (useMockYahoo()) {
    const data = await mockRoster(teamId)
    if (week) data.week = week
    return data
  }
  const params = new URLSearchParams({ teamId })
  if (week) params.set('week', String(week))
  return fetchJson<RosterResponse>(`/roster?${params}`)
}

export async function getWaivers(
  teamId: ManagedTeamId,
  options?: {
    position?: string
    systems?: string[]
  },
): Promise<WaiversResponse> {
  if (useMockYahoo()) {
    const data = await mockWaivers(teamId)
    if (options?.systems?.length) {
      const set = new Set(options.systems)
      return {
        ...data,
        freeAgents: data.freeAgents.filter((p) => set.has(p.nflTeam)),
        recommendedBlocks: data.recommendedBlocks.filter((b) =>
          set.has(b.nflTeam),
        ),
      }
    }
    return data
  }
  const params = new URLSearchParams({ teamId })
  if (options?.position) params.set('position', options.position)
  if (options?.systems?.length) params.set('systems', options.systems.join(','))
  return fetchJson<WaiversResponse>(`/waivers?${params}`)
}

export async function getSchedule(
  teamId: ManagedTeamId,
  weeksAhead = 3,
): Promise<ScheduleResponse> {
  if (useMockYahoo()) return mockSchedule(teamId)
  return fetchJson<ScheduleResponse>(
    `/schedule?teamId=${teamId}&weeksAhead=${weeksAhead}`,
  )
}

export async function getStandings(): Promise<StandingsResponse> {
  if (useMockYahoo()) return mockStandings()
  return fetchJson<StandingsResponse>('/standings')
}
