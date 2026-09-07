export type InjuryStatus = 'Q' | 'D' | 'O' | 'P' | 'IR' | 'CEL' | null

export interface Player {
  playerKey: string
  name: string
  position: string
  selectedPosition: string
  nflTeam: string
  opponent?: string
  gameTime?: string
  projectedPoints: number
  actualPoints?: number
  injuryStatus: InjuryStatus
  percentOwned?: number
}

export interface TeamSummary {
  teamKey: string
  name: string
  managerName?: string
  projectedTotal: number
  actualTotal?: number
}

export interface RosterResponse {
  week: number
  team: TeamSummary
  starters: Player[]
  bench: Player[]
}

export interface PositionalDifferential {
  position: string
  myPoints: number
  oppPoints: number
  differential: number
}

export interface LeverageFlag {
  type: string
  severity: 'high' | 'medium' | 'low'
  message: string
  myPlayerKey?: string
  relatedPlayerKey?: string
}

export interface MatchupResponse {
  week: number
  myTeam: TeamSummary
  opponent: TeamSummary
  myStarters: Player[]
  oppStarters: Player[]
  myBench: Player[]
  oppBench: Player[]
  positionalDifferentials: PositionalDifferential[]
  leverageFlags: LeverageFlag[]
}

export interface HandcuffSuggestion {
  injuredPlayer: Player
  injuredOnTeamKey: string
  injuredOnTeamName: string
  backup: Player
  reason: string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface WaiverBlock {
  targetPlayer: string
  playerKey: string
  position: string
  nflTeam: string
  rationale: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface WaiversResponse {
  freeAgents: Player[]
  waiverPlayers: Player[]
  handcuffBlocks: HandcuffSuggestion[]
  recommendedBlocks: WaiverBlock[]
  targetedSystems: string[]
}

export interface ScheduleCell {
  week: number
  playerKey: string
  playerName: string
  position: string
  isBye: boolean
  opponent?: string
  opponentDefRank?: number
  softSchedule: boolean
}

export interface ScheduleMatrixPlayer {
  playerKey: string
  name: string
  managerId: string
  status: InjuryStatus
  team: string
  position: string
}

export interface ScheduleMatrixGame {
  id: string
  kickoffET: string
  awayTeam: string
  homeTeam: string
  fantasyRelevance: ScheduleMatrixPlayer[]
  leverageFlag?: {
    active: boolean
    type: string
    description: string
  }
}

export interface ScheduleMatrix {
  week: number
  games: ScheduleMatrixGame[]
}

export interface ByeLookahead {
  targetWeek: number
  userByeCount: number
  affectedUserPlayers: Array<{
    playerKey: string
    name: string
    position: string
  }>
  notes: string
}

export interface ScheduleResponse {
  weeks: number[]
  myPlayers: ScheduleCell[]
  byeOverlapWeeks: number[]
  buyLowTargets: Array<{
    player: Player
    teamName: string
    softWeeksAhead: number[]
    reason: string
  }>
  scheduleMatrix?: ScheduleMatrix
  byeLookahead?: ByeLookahead
}

export interface StandingsResponse {
  standings: Array<{
    rank: number
    teamKey: string
    name: string
    ownerName?: string
    wins: number
    losses: number
    ties: number
    pointsFor: number
    projectedSeasonPoints?: number
    projectedRecord?: string
  }>
}

export interface HealthResponse {
  ok: boolean
  mode: 'mock' | 'live'
  leagueId: string | null
  mcpConnected: boolean
  leagueName?: string
}

export interface LeagueManager {
  managerId: string
  teamName: string
  ownerName: string
  isUser: boolean
}

export interface LeagueDump {
  league: {
    name: string
    totalTeams: number
    currentWeek: number
    userTeamId: string
    managers: LeagueManager[]
  }
  standings: Array<{
    rank: number
    managerId: string
    wins: number
    losses: number
    ties: number
    pointsFor: number
    projectedSeasonPoints: number
    projectedRecord: string
  }>
  matchup: {
    week: number
    userTeam: {
      managerId: string
      teamName: string
      projectedTotal: number
      actualTotal: number
      starters: Player[]
      bench: Player[]
    }
    opponentTeam: {
      managerId: string
      teamName: string
      projectedTotal: number
      actualTotal: number
      starters: Player[]
      bench: Player[]
    }
  }
  waivers: {
    recommendedBlocks: WaiverBlock[]
  }
  byeLookahead: ByeLookahead
  scheduleMatrix: ScheduleMatrix
}
