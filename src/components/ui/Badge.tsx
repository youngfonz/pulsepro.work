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
          'border border-muted-foreground/40 text-muted-foreground bg-muted-foreground/5': variant === 'default',
          'border border-success/50 text-success bg-success/5': variant === 'success',
          'border border-warning/50 text-warning bg-warning/5': variant === 'warning',
          'border border-destructive/50 text-destructive bg-destructive/5': variant === 'danger',
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
