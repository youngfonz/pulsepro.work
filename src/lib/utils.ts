import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date(new Date().toDateString())
}

export function isDueThisWeek(date: Date | string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return d >= today && d <= weekFromNow
}

export function isDueToday(date: Date | string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

// Subtle, professional badge styles - outline-based design
// Less visual noise while maintaining clarity
export const statusColors: Record<string, string> = {
  active: 'border border-success/50 text-success bg-success/5',
  inactive: 'border border-muted-foreground/40 text-muted-foreground bg-muted-foreground/5',
  not_started: 'border border-muted-foreground/40 text-muted-foreground bg-muted-foreground/5',
  in_progress: 'border border-primary/50 text-primary bg-primary/5',
  on_hold: 'border border-warning/50 text-warning bg-warning/5',
  completed: 'border border-success/50 text-success bg-success/5',
}

export const priorityColors: Record<string, string> = {
  low: 'border border-success/50 text-success bg-success/5',
  medium: 'border border-warning/50 text-warning bg-warning/5',
  high: 'border border-destructive/50 text-destructive bg-destructive/5',
}

export const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
}

export const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType === 'application/msword') return '📝'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
  if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') return '📑'
  if (mimeType === 'text/plain') return '📃'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦'
  return '📎'
}
