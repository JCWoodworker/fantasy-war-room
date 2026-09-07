import { createFileRoute } from '@tanstack/react-router'

import { DashboardHome } from '#/components/features/dashboard-home'

export const Route = createFileRoute('/')({ component: DashboardHome })
