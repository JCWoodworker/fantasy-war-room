import leagueDump from '#/data/mock-league-week1.json'
import type {
  HandcuffSuggestion,
  LeverageFlag,
  LeagueDump,
  MatchupResponse,
  Player,
  PositionalDifferential,
  RosterResponse,
  ScheduleResponse,
  StandingsResponse,
  WaiversResponse,
} from '#/types/yahoo'

const dump = leagueDump as LeagueDump

function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function managerName(managerId: string): string {
  return (
    dump.league.managers.find((m) => m.managerId === managerId)?.ownerName ??
    managerId
  )
}

function teamName(managerId: string): string {
  return (
    dump.league.managers.find((m) => m.managerId === managerId)?.teamName ??
    managerId
  )
}

function sumProjected(players: Player[]): number {
  return Number(
    players.reduce((sum, p) => sum + (p.projectedPoints || 0), 0).toFixed(2),
  )
}

function positionalDifferentials(
  mine: Player[],
  opp: Player[],
): PositionalDifferential[] {
  const positions = ['QB', 'RB', 'WR', 'TE', 'W/R/T', 'K', 'DEF']
  return positions
    .map((position) => {
      const myPoints = sumProjected(
        mine.filter((p) => p.selectedPosition === position),
      )
      const oppPoints = sumProjected(
        opp.filter((p) => p.selectedPosition === position),
      )
      if (myPoints === 0 && oppPoints === 0) return null
      return {
        position,
        myPoints,
        oppPoints,
        differential: Number((myPoints - oppPoints).toFixed(2)),
      }
    })
    .filter((row): row is PositionalDifferential => row !== null)
}

function leverageFromMatchupAndMatrix(): LeverageFlag[] {
  const flags: LeverageFlag[] = []

  // Classic negative correlation: my QB vs their DEF same NFL team
  for (const qb of dump.matchup.userTeam.starters.filter((p) => p.position === 'QB')) {
    for (const def of dump.matchup.opponentTeam.starters.filter(
      (p) => p.position === 'DEF',
    )) {
      if (qb.nflTeam && def.nflTeam && qb.nflTeam === def.nflTeam) {
        flags.push({
          type: 'NEGATIVE_CORRELATION',
          severity: 'high',
          message: `You start ${qb.name} (${qb.nflTeam}) against their ${def.name} — scoring plays strip their DEF points.`,
          myPlayerKey: qb.playerKey,
          relatedPlayerKey: def.playerKey,
        })
      }
    }
  }

  for (const game of dump.scheduleMatrix.games) {
    if (!game.leverageFlag?.active) continue
    const involvesUser = game.fantasyRelevance.some(
      (p) => p.managerId === dump.league.userTeamId,
    )
    const involvesOpp = game.fantasyRelevance.some(
      (p) => p.managerId === dump.matchup.opponentTeam.managerId,
    )
    if (!involvesUser && !involvesOpp) continue
    flags.push({
      type: game.leverageFlag.type,
      severity:
        game.leverageFlag.type === 'NEGATIVE_CORRELATION' ? 'high' : 'medium',
      message: game.leverageFlag.description,
    })
  }

  // Dedupe by message
  const seen = new Set<string>()
  return flags.filter((f) => {
    if (seen.has(f.message)) return false
    seen.add(f.message)
    return true
  })
}

export async function loadLeagueDump(): Promise<LeagueDump> {
  return delay(dump)
}

export async function mockHealth() {
  return delay({
    ok: true,
    mode: 'mock' as const,
    leagueId: dump.league.name,
    mcpConnected: false,
    leagueName: dump.league.name,
  })
}

export async function mockMatchup(): Promise<MatchupResponse> {
  const { userTeam, opponentTeam, week } = dump.matchup
  return delay({
    week,
    myTeam: {
      teamKey: userTeam.managerId,
      name: userTeam.teamName,
      managerName: managerName(userTeam.managerId),
      projectedTotal: userTeam.projectedTotal,
      actualTotal: userTeam.actualTotal,
    },
    opponent: {
      teamKey: opponentTeam.managerId,
      name: opponentTeam.teamName,
      managerName: managerName(opponentTeam.managerId),
      projectedTotal: opponentTeam.projectedTotal,
      actualTotal: opponentTeam.actualTotal,
    },
    myStarters: userTeam.starters,
    myBench: userTeam.bench,
    oppStarters: opponentTeam.starters,
    oppBench: opponentTeam.bench,
    positionalDifferentials: positionalDifferentials(
      userTeam.starters,
      opponentTeam.starters,
    ),
    leverageFlags: leverageFromMatchupAndMatrix(),
  })
}

export async function mockRoster(): Promise<RosterResponse> {
  const { userTeam, week } = dump.matchup
  return delay({
    week,
    team: {
      teamKey: userTeam.managerId,
      name: userTeam.teamName,
      managerName: managerName(userTeam.managerId),
      projectedTotal: userTeam.projectedTotal,
      actualTotal: userTeam.actualTotal,
    },
    starters: userTeam.starters,
    bench: userTeam.bench,
  })
}

export async function mockWaivers(): Promise<WaiversResponse> {
  const blocks = dump.waivers.recommendedBlocks
  const handcuffBlocks: HandcuffSuggestion[] = blocks.map((block) => ({
    injuredPlayer: {
      playerKey: `injured-for-${block.playerKey}`,
      name:
        block.nflTeam === 'SF'
          ? 'Christian McCaffrey'
          : block.nflTeam === 'ARI'
            ? 'Jeremiyah Love'
            : block.nflTeam === 'GB'
              ? 'Josh Jacobs'
              : 'Opponent injury',
      position: block.position,
      selectedPosition: block.position,
      nflTeam: block.nflTeam,
      projectedPoints: 0,
      injuryStatus: block.nflTeam === 'GB' ? 'CEL' : 'Q',
    },
    injuredOnTeamKey:
      block.nflTeam === 'SF' || block.nflTeam === 'ARI'
        ? 'marianne_team'
        : block.nflTeam === 'NYJ'
          ? 'latino_heat'
          : 'latino_heat',
    injuredOnTeamName:
      block.nflTeam === 'SF' || block.nflTeam === 'ARI'
        ? teamName('marianne_team')
        : teamName('latino_heat'),
    backup: {
      playerKey: block.playerKey,
      name: block.targetPlayer,
      position: block.position,
      selectedPosition: 'FA',
      nflTeam: block.nflTeam,
      projectedPoints: 0,
      injuryStatus: null,
    },
    reason: block.rationale,
    priority: block.priority,
  }))

  return delay({
    freeAgents: blocks.map((block) => ({
      playerKey: block.playerKey,
      name: block.targetPlayer,
      position: block.position,
      selectedPosition: 'FA',
      nflTeam: block.nflTeam,
      projectedPoints: 0,
      injuryStatus: null,
    })),
    waiverPlayers: [],
    handcuffBlocks,
    recommendedBlocks: blocks,
    targetedSystems: [...new Set(blocks.map((b) => b.nflTeam))],
  })
}

export async function mockSchedule(): Promise<ScheduleResponse> {
  const bye = dump.byeLookahead
  const myPlayers = [
    ...dump.matchup.userTeam.starters,
    ...dump.matchup.userTeam.bench,
  ].map((player) => ({
    week: dump.scheduleMatrix.week,
    playerKey: player.playerKey,
    playerName: player.name,
    position: player.position,
    isBye: bye.affectedUserPlayers.some((p) => p.playerKey === player.playerKey),
    opponent: player.opponent,
    softSchedule: false,
  }))

  // Also surface week 11 bye rows for affected players
  const week11Rows = bye.affectedUserPlayers.map((player) => ({
    week: bye.targetWeek,
    playerKey: player.playerKey,
    playerName: player.name,
    position: player.position,
    isBye: true,
    softSchedule: false,
  }))

  return delay({
    weeks: [dump.scheduleMatrix.week, bye.targetWeek],
    myPlayers: [...myPlayers, ...week11Rows],
    byeOverlapWeeks: [bye.targetWeek],
    buyLowTargets: [],
    scheduleMatrix: dump.scheduleMatrix,
    byeLookahead: bye,
  })
}

export async function mockStandings(): Promise<StandingsResponse> {
  return delay({
    standings: dump.standings.map((row) => ({
      rank: row.rank,
      teamKey: row.managerId,
      name: teamName(row.managerId),
      ownerName: managerName(row.managerId),
      wins: row.wins,
      losses: row.losses,
      ties: row.ties,
      pointsFor: row.pointsFor,
      projectedSeasonPoints: row.projectedSeasonPoints,
      projectedRecord: row.projectedRecord,
    })),
  })
}
