import { createFileRoute } from '@tanstack/react-router'

import { TradeForecaster } from '#/components/features/trade-forecaster'

export const Route = createFileRoute('/schedule')({
  component: TradeForecaster,
})
