import { createFileRoute } from '@tanstack/react-router'

import { MatchupExploiter } from '#/components/features/matchup-exploiter'

export const Route = createFileRoute('/matchup')({
  component: MatchupExploiter,
})
