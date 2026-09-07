import { createFileRoute } from '@tanstack/react-router'

import { WaiverRadar } from '#/components/features/waiver-radar'

export const Route = createFileRoute('/waivers')({
  component: WaiverRadar,
})
