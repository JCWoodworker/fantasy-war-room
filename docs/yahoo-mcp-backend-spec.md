# Yahoo Fantasy MCP Backend Spec

Contract for the NestJS mega-backend subapp that powers **The Grok Bowers War Room** frontend (`fantasy-war-room`).

## Overview

| Item | Value |
|------|--------|
| Nest repo | `/Users/jc/2023-Portfolio-Projects/nestjs_mega_backend` |
| Subapp path | `src/subapps/fantasy-war-room/` |
| HTTP base | `/api/v1/subapps/fantasy-war-room` |
| MCP server | [`spilchen/yahoo_fantasy_mcp`](https://github.com/spilchen/yahoo_fantasy_mcp) (read-only) |
| Transport | stdio (Nest spawns Python as child process) |
| Auth | `@Auth(AuthType.None)` for v1 (league data is private via Yahoo OAuth on the Nest host) |

```text
Frontend (Netlify)
  → GET /api/v1/subapps/fantasy-war-room/*
    → FantasyWarRoomController
      → YahooMcpClientService
        → python -m yahoo_fantasy_mcp (stdio MCP)
          → Yahoo Fantasy API
```

## Environment variables (Nest)

| Variable | Required | Description |
|----------|----------|-------------|
| `YAHOO_LEAGUE_ID` | Yes (live mode) | e.g. `449.l.123456` |
| `YAHOO_CLIENT_ID` | If no oauth2.json | Yahoo consumer key |
| `YAHOO_CLIENT_SECRET` | If no oauth2.json | Yahoo consumer secret |
| `YAHOO_OAUTH2_FILE` | Recommended | Absolute path to `oauth2.json` |
| `YAHOO_MCP_COMMAND` | No | Default `python3` |
| `YAHOO_MCP_ARGS` | No | Default `-m,yahoo_fantasy_mcp` (comma-separated) |
| `YAHOO_MCP_CWD` | No | Working directory for MCP (must contain oauth2.json if using relative path) |
| `FANTASY_WAR_ROOM_USE_MOCK` | No | `true` to return mock payloads without spawning MCP |
| `ALLOWED_ORIGINS_DEVELOPMENT` | Yes (dev) | Include `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Yes (preprod/prod) | Include Netlify site origin (`https://fantasywr.netlify.app`) |

## Heroku (Nest mega-backend)

| Env | App | Remote | Branch |
|-----|-----|--------|--------|
| Preprod | `nestjs-mega-backend-preprod` | `herokupp` | `preprod` (manual deploy often) |
| Prod | `nestjs-mega-backend-prod` | `herokuprod` | `main` |

```bash
# Already set for mock-first + CORS to fantasywr.netlify.app
heroku config:get FANTASY_WAR_ROOM_USE_MOCK -a nestjs-mega-backend-preprod
heroku config:get ALLOWED_ORIGINS -a nestjs-mega-backend-preprod

# Deploy preprod manually after merging to preprod branch:
git push origin preprod
git push herokupp preprod:main

# Prod typically follows pushes to main (GitHub → Heroku) or:
git push herokuprod main:main

# Smoke:
curl https://nestjs-mega-backend-preprod.herokuapp.com/api/v1/subapps/fantasy-war-room/health
```

### One-time Yahoo OAuth

1. Create a Yahoo Developer app with Fantasy Sports read access.
2. Generate `oauth2.json` via `yahoo_oauth.OAuth2` / yahoo_fantasy_api flow.
3. Point `YAHOO_OAUTH2_FILE` (or `YAHOO_MCP_CWD`) at that file.
4. Set `YAHOO_LEAGUE_ID`. If unset, MCP lists leagues and exits — useful for discovery.

## Nest module layout

```text
src/subapps/fantasy-war-room/
  fantasy-war-room.module.ts
  fantasy-war-room.controller.ts
  fantasy-war-room.service.ts
  config/fantasy-war-room.config.ts
  mcp/yahoo-mcp-client.service.ts
  dto/
    player.dto.ts
    roster.dto.ts
    matchup.dto.ts
    waivers.dto.ts
    schedule.dto.ts
  mocks/mock-yahoo-data.ts
```

Register in:

- `subapps.module.ts` → import `FantasyWarRoomModule`
- `app.module.ts` → RouterModule child `{ path: 'fantasy-war-room', module: FantasyWarRoomModule }`

## REST endpoints

All under `/api/v1/subapps/fantasy-war-room`.

### `GET /health`

```json
{
  "ok": true,
  "mode": "mock" | "live",
  "leagueId": "449.l.123456" | null,
  "mcpConnected": true
}
```

### `GET /roster?teamKey=&week=`

Own roster (defaults to logged-in Yahoo team via `get_team_key`).

**Response:** `RosterResponse`

### `GET /matchup?week=`

Side-by-side matchup for the current (or specified) week.

**Response:** `MatchupResponse`

### `GET /waivers?position=&systems=`

Free agents + waiver players, with injury-block suggestions derived from opposing/injured roster players.

**Response:** `WaiversResponse`

### `GET /schedule?weeksAhead=3`

3-week lookahead matrix for bye overlaps and soft defensive schedules.

**Response:** `ScheduleResponse`

### `GET /standings` (optional)

**Response:** `StandingsResponse`

## TypeScript DTOs (shared contract)

Frontend mirrors these under `src/types/yahoo.ts`.

```ts
export type InjuryStatus = 'Q' | 'D' | 'O' | 'P' | 'IR' | null

export interface Player {
  playerKey: string
  name: string
  position: string // QB | RB | WR | TE | K | DEF | BN | IR | ...
  selectedPosition: string // slot on roster
  nflTeam: string // e.g. DEN
  opponent?: string // e.g. @KC
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
  differential: number // my - opp
}

export interface LeverageFlag {
  type: 'negative_correlation'
  severity: 'high' | 'medium' | 'low'
  message: string
  myPlayerKey: string
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
}

export interface WaiversResponse {
  freeAgents: Player[]
  waiverPlayers: Player[]
  handcuffBlocks: HandcuffSuggestion[]
  targetedSystems: string[] // e.g. ["DEN", "GB"]
}

export interface ScheduleCell {
  week: number
  playerKey: string
  playerName: string
  position: string
  isBye: boolean
  opponent?: string
  opponentDefRank?: number // 1 = toughest, 32 = softest (approx)
  softSchedule: boolean
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
}

export interface StandingsResponse {
  standings: Array<{
    rank: number
    teamKey: string
    name: string
    wins: number
    losses: number
    ties: number
    pointsFor: number
  }>
}
```

## MCP tool mapping

| Endpoint | MCP tools used |
|----------|----------------|
| `/roster` | `get_team_key`, `get_current_week`, `get_team_roster` |
| `/matchup` | `get_team_key`, `get_current_week`, `get_team_matchup`, `get_team_roster` (×2), optionally `get_matchup_scores` |
| `/waivers` | `get_teams`, `get_team_roster` (scan injuries), `get_free_agents`, `get_waivers` |
| `/schedule` | `get_current_week`, `get_team_roster`, `get_teams`, player/schedule enrichment where available |
| `/standings` | `get_league_standings` |
| `/health` | process ping / cached connection state |

### Domain logic (Nest service, not MCP)

- **Injury badges:** map Yahoo status → `Q` / `D` / `O` / etc.
- **Positional differentials:** group starters by position; sum projected (or actual) points; `my - opp`.
- **Leverage flags:** if my starter is QB whose `nflTeam` equals opponent DEF `nflTeam` (or vice versa), emit `negative_correlation`.
- **Handcuff blocks:** for injured RBs/WRs on other teams, find FA/waiver players on same `nflTeam` at same position group.
- **Bye overlaps:** flag weeks where 2+ of my starters have `isBye`.
- **Buy-low:** players on other rosters with low recent points but upcoming soft `opponentDefRank` (≥ 20).

## MCP client behavior

1. On module init (if not mock): spawn `YAHOO_MCP_COMMAND` with args, env, cwd.
2. Connect via `@modelcontextprotocol/sdk` `Client` + `StdioClientTransport`.
3. `callTool({ name, arguments })` → parse `content` / structured payload.
4. On module destroy: close transport / kill child.
5. If spawn fails and mock enabled → serve mocks; else throw `503`.

## CORS

Add to Nest `ALLOWED_ORIGINS_DEVELOPMENT`:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

Add production Netlify origin to `ALLOWED_ORIGINS`.

## Frontend env

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1/subapps/fantasy-war-room
# During Nest local default port collision, Nest often uses PORT=3000 —
# prefer Nest on 3001 and Vite on 3000:
# VITE_API_BASE_URL=http://localhost:3001/api/v1/subapps/fantasy-war-room
VITE_USE_MOCK_YAHOO=true
```

Recommend Nest `PORT=3001` in local `.env` when developing alongside Vite on `3000`.

## Out of scope (v1)

- Write operations (set lineup, claims, trades)
- Shared npm package for DTOs (mirror types instead)
- Serverless-compatible MCP (stdio needs always-on Nest host)
