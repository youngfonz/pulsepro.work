import { notFound } from 'next/navigation'
import { getTask, getProjectsForTaskFilter } from '@/actions/tasks'
import { TaskDetail } from './TaskDetail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params
  const [task, projects] = await Promise.all([getTask(id), getProjectsForTaskFilter()])

  if (!task) {
    notFound()
  }

  return <TaskDetail task={task} projects={projects} />
}
