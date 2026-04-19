import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

// Subtle, professional badge design with outline style
export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-px text-xs font-medium leading-5 whitespace-nowrap',
        {
          'border border-zinc-400/50 text-zinc-600 dark:text-zinc-400 bg-zinc-500/5': variant === 'default',
          'border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5': variant === 'success',
          'border border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/5': variant === 'warning',
          'border border-rose-500/50 text-rose-600 dark:text-rose-400 bg-rose-500/5': variant === 'danger',
          'border border-primary/50 text-primary bg-primary/5': variant === 'info',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
