import leagueDump from '#/data/mock-league-week1.json'
import type { ManagedTeamId } from '#/stores/war-room-store'
import type {
  HandcuffSuggestion,
  LeverageFlag,
  LeagueDump,
  MatchupBundle,
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

function getMatchupBundle(teamId: ManagedTeamId): MatchupBundle {
  const bundle = dump.matchups[teamId]
  if (!bundle) {
    throw new Error(`No matchup mock for team ${teamId}`)
  }
  return bundle
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

function leverageForTeam(teamId: ManagedTeamId): LeverageFlag[] {
  const matchup = getMatchupBundle(teamId)
  const flags: LeverageFlag[] = []

  for (const qb of matchup.userTeam.starters.filter((p) => p.position === 'QB')) {
    for (const def of matchup.opponentTeam.starters.filter(
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

  // Amanda: Dak vs opponent Cowboys stack pieces
  if (teamId === 'two_pint_conversion') {
    const dak = matchup.userTeam.starters.find((p) => p.playerKey === 'dak-prescott')
    const lamb = matchup.opponentTeam.starters.find(
      (p) => p.playerKey === 'ceedee-lamb',
    )
    if (dak && lamb) {
      flags.push({
        type: 'SNF_STACK_CORRELATION',
        severity: 'high',
        message:
          'Dak Prescott faces Ham N Eggers’ CeeDee/Aubrey/Nabers exposure. Non-Lamb Dak production surges you while capping B-Nice.',
        myPlayerKey: dak.playerKey,
        relatedPlayerKey: lamb.playerKey,
      })
    }
    const waddle = matchup.userTeam.starters.find(
      (p) => p.playerKey === 'jaylen-waddle',
    )
    const rice = matchup.userTeam.starters.find((p) => p.playerKey === 'rashee-rice')
    if (waddle && rice) {
      flags.push({
        type: 'MNF_PASS_CATCHER_STACK',
        severity: 'medium',
        message:
          'You own Waddle + Rice (~27 combined) in the final game — late leverage to erase a Sunday deficit while Mahomes sits on B-Nice’s bench.',
        myPlayerKey: waddle.playerKey,
        relatedPlayerKey: rice.playerKey,
      })
    }
  }

  for (const game of dump.scheduleMatrix.games) {
    if (!game.leverageFlag?.active) continue
    const involvesUser = game.fantasyRelevance.some((p) => p.managerId === teamId)
    const involvesOpp = game.fantasyRelevance.some(
      (p) => p.managerId === matchup.opponentTeam.managerId,
    )
    if (!involvesUser && !involvesOpp) continue
    flags.push({
      type: game.leverageFlag.type,
      severity:
        game.leverageFlag.type === 'NEGATIVE_CORRELATION' ? 'high' : 'medium',
      message: game.leverageFlag.description,
    })
  }

  const seen = new Set<string>()
  return flags.filter((f) => {
    if (seen.has(f.message)) return false
    seen.add(f.message)
    return true
  })
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

export async function mockMatchup(
  teamId: ManagedTeamId,
): Promise<MatchupResponse> {
  const { userTeam, opponentTeam, week } = getMatchupBundle(teamId)
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
    leverageFlags: leverageForTeam(teamId),
  })
}

export async function mockRoster(teamId: ManagedTeamId): Promise<RosterResponse> {
  const { userTeam, week } = getMatchupBundle(teamId)
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

export async function mockWaivers(
  teamId: ManagedTeamId,
): Promise<WaiversResponse> {
  const blocks =
    dump.waiversByTeam[teamId]?.recommendedBlocks ??
    dump.waiversByTeam.grok_bowers?.recommendedBlocks ??
    []

  const handcuffBlocks: HandcuffSuggestion[] = blocks.map((block) => ({
    injuredPlayer: {
      playerKey: `context-${block.playerKey}`,
      name:
        teamId === 'two_pint_conversion'
          ? 'Ham N Eggers injury watch'
          : block.nflTeam === 'SF'
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
      teamId === 'two_pint_conversion' ? 'ham_n_eggers' : 'marianne_team',
    injuredOnTeamName:
      teamId === 'two_pint_conversion'
        ? teamName('ham_n_eggers')
        : teamName('marianne_team'),
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

export async function mockSchedule(
  teamId: ManagedTeamId,
): Promise<ScheduleResponse> {
  const matchup = getMatchupBundle(teamId)
  const bye =
    dump.byeLookaheadByTeam[teamId] ?? dump.byeLookaheadByTeam.grok_bowers

  const myPlayers = [...matchup.userTeam.starters, ...matchup.userTeam.bench].map(
    (player) => ({
      week: dump.scheduleMatrix.week,
      playerKey: player.playerKey,
      playerName: player.name,
      position: player.position,
      isBye: bye.affectedUserPlayers.some((p) => p.playerKey === player.playerKey),
      opponent: player.opponent,
      softSchedule: false,
    }),
  )

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
    byeOverlapWeeks: bye.affectedUserPlayers.length ? [bye.targetWeek] : [],
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
