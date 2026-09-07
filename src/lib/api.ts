import {
  mockHealth,
  mockMatchup,
  mockRoster,
  mockSchedule,
  mockStandings,
  mockWaivers,
} from '#/data/league-mock'
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

export async function getMatchup(week?: number): Promise<MatchupResponse> {
  if (useMockYahoo()) {
    const data = await mockMatchup()
    if (week) data.week = week
    return data
  }
  const query = week ? `?week=${week}` : ''
  return fetchJson<MatchupResponse>(`/matchup${query}`)
}

export async function getRoster(
  teamKey?: string,
  week?: number,
): Promise<RosterResponse> {
  if (useMockYahoo()) {
    const data = await mockRoster()
    if (week) data.week = week
    return data
  }
  const params = new URLSearchParams()
  if (teamKey) params.set('teamKey', teamKey)
  if (week) params.set('week', String(week))
  const query = params.toString() ? `?${params}` : ''
  return fetchJson<RosterResponse>(`/roster${query}`)
}

export async function getWaivers(options?: {
  position?: string
  systems?: string[]
}): Promise<WaiversResponse> {
  if (useMockYahoo()) {
    const data = await mockWaivers()
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
  const params = new URLSearchParams()
  if (options?.position) params.set('position', options.position)
  if (options?.systems?.length) params.set('systems', options.systems.join(','))
  const query = params.toString() ? `?${params}` : ''
  return fetchJson<WaiversResponse>(`/waivers${query}`)
}

export async function getSchedule(weeksAhead = 3): Promise<ScheduleResponse> {
  if (useMockYahoo()) return mockSchedule()
  return fetchJson<ScheduleResponse>(`/schedule?weeksAhead=${weeksAhead}`)
}

export async function getStandings(): Promise<StandingsResponse> {
  if (useMockYahoo()) return mockStandings()
  return fetchJson<StandingsResponse>('/standings')
}
