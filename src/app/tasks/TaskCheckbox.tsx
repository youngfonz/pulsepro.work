'use client'

import { useTransition } from 'react'
import { toggleTask } from '@/actions/tasks'

interface TaskCheckboxProps {
  taskId: string
  done: boolean
}

export function TaskCheckbox({ taskId, done }: TaskCheckboxProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(taskId)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        done
          ? 'bg-success border-success text-success-foreground'
          : 'border-border hover:border-primary'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      {done && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
