import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--accent-soft)] text-[var(--accent)]',
        secondary:
          'border-[var(--border)] bg-[var(--panel-elevated)] text-[var(--muted)]',
        injuryQ: 'border-transparent bg-amber-500/20 text-amber-300',
        injuryD: 'border-transparent bg-orange-500/25 text-orange-300',
        injuryO: 'border-transparent bg-red-600/30 text-red-300',
        injuryCEL:
          'border-transparent bg-gradient-to-r from-red-600/40 to-purple-600/40 text-fuchsia-200',
        positive: 'border-transparent bg-emerald-500/20 text-emerald-300',
        negative: 'border-transparent bg-red-500/20 text-red-300',
        leverage: 'border-transparent bg-fuchsia-500/20 text-fuchsia-300',
        priorityHigh: 'border-transparent bg-red-500/25 text-red-200',
        priorityMed: 'border-transparent bg-amber-500/20 text-amber-200',
        priorityLow: 'border-transparent bg-[var(--panel-elevated)] text-[var(--muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
