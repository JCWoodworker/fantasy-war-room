import leagueDump from '#/data/mock-league-week1.json'
import type { ManagedTeamId } from '#/stores/war-room-store'
import { MANAGED_TEAMS } from '#/stores/war-room-store'
import type {
  HandcuffSuggestion,
  LeverageFlag,
  LeagueDump,
  MatchupBundle,
  MatchupResponse,
  Player,
  PositionalDifferential,
  RosterResponse,
  ScheduleMatrix,
  ScheduleResponse,
  StandingsResponse,
  WaiversResponse,
} from '#/types/yahoo'

const dump = leagueDump as LeagueDump

const MANAGED_IDS = new Set(MANAGED_TEAMS.map((t) => t.id))

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

/** Session scope: active manager + their weekly opponent only. */
function matchupParticipantIds(teamId: ManagedTeamId): Set<string> {
  const matchup = getMatchupBundle(teamId)
  return new Set([
    matchup.userTeam.managerId,
    matchup.opponentTeam.managerId,
  ])
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

  if (teamId === 'two_pint_conversion') {
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
    if (game.leverageFlag.forManagerId !== teamId) continue
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

/**
 * Strip every other managed team (and unrelated managers) out of the slate so
 * James and Amanda never see each other's roster tags or leverage copy.
 */
function scheduleMatrixForTeam(teamId: ManagedTeamId): ScheduleMatrix {
  const allowed = matchupParticipantIds(teamId)

  const games = dump.scheduleMatrix.games
    .map((game) => {
      const fantasyRelevance = game.fantasyRelevance.filter((p) =>
        allowed.has(p.managerId),
      )
      const leverageForActive =
        game.leverageFlag?.active && game.leverageFlag.forManagerId === teamId
          ? game.leverageFlag
          : undefined

      return {
        ...game,
        fantasyRelevance,
        leverageFlag: leverageForActive,
      }
    })
    .filter(
      (game) =>
        game.fantasyRelevance.length > 0 || Boolean(game.leverageFlag?.active),
    )

  return {
    week: dump.scheduleMatrix.week,
    games,
  }
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
  const teamWaivers = dump.waiversByTeam[teamId]
  if (!teamWaivers) {
    throw new Error(`No waiver mock for team ${teamId}`)
  }
  const blocks = teamWaivers.recommendedBlocks
  const matchup = getMatchupBundle(teamId)
  const oppId = matchup.opponentTeam.managerId

  const handcuffBlocks: HandcuffSuggestion[] = blocks.map((block) => ({
    injuredPlayer: {
      playerKey: `context-${block.playerKey}`,
      name: `${teamName(oppId)} injury watch`,
      position: block.position,
      selectedPosition: block.position,
      nflTeam: block.nflTeam,
      projectedPoints: 0,
      injuryStatus: block.nflTeam === 'GB' ? 'CEL' : 'Q',
    },
    injuredOnTeamKey: oppId,
    injuredOnTeamName: teamName(oppId),
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
  const bye = dump.byeLookaheadByTeam[teamId]
  if (!bye) {
    throw new Error(`No bye lookahead mock for team ${teamId}`)
  }

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
    scheduleMatrix: scheduleMatrixForTeam(teamId),
    byeLookahead: bye,
  })
}

export async function mockStandings(): Promise<StandingsResponse> {
  // League standings are public; both managers appear as peers (not as session data).
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

/** Dev/test helper: assert no other managed-team ids leak into a scoped payload. */
export function assertNoManagedCrossTalk(
  teamId: ManagedTeamId,
  managerIds: Iterable<string>,
) {
  const allowed = matchupParticipantIds(teamId)
  for (const id of managerIds) {
    if (MANAGED_IDS.has(id) && !allowed.has(id)) {
      throw new Error(`Managed-team leak: saw ${id} while viewing ${teamId}`)
    }
  }
}
