export interface Project {
  id: string
  name: string
  description: string | null
  notes: string | null
  status: string
  priority: string
  dueDate: string | null
  budget: number | null
  hourlyRate: number | null
  clientId: string
  userId: string
  createdAt: string
  updatedAt: string
  client: { id: string; name: string }
  tasks?: Task[]
  images?: ProjectImage[]
  timeEntries?: TimeEntry[]
  _count?: { tasks: number }
}

export interface Task {
  id: string
  title: string
  description: string | null
  notes: string | null
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
  url: string | null
  bookmarkType: string | null
  thumbnailUrl: string | null
  tags: string[]
  projectId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  project?: { id: string; name: string; client?: { id: string; name: string } } | null
  images?: TaskImage[]
  files?: TaskFile[]
  comments?: TaskComment[]
  _count?: { comments: number }
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  logo: string | null
  status: string
  notes: string | null
  userId: string
  createdAt: string
  updatedAt: string
  projects?: Project[]
}

export interface Invoice {
  id: string
  number: string
  status: string
  dueDate: string
  taxRate: number
  notes: string | null
  fromName: string | null
  fromEmail: string | null
  fromAddress: string | null
  shareToken: string
  paidAt: string | null
  clientId: string
  projectId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string }
  project?: { id: string; name: string } | null
  items?: InvoiceItem[]
  subtotal?: number
  total?: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  invoiceId: string
}

export interface TaskComment {
  id: string
  content: string
  taskId: string
  createdAt: string
  updatedAt: string
}

export interface TaskImage {
  id: string
  path: string
  name: string
  taskId: string
}

export interface TaskFile {
  id: string
  path: string
  name: string
  type: string
  size: number
  taskId: string
}

export interface ProjectImage {
  id: string
  path: string
  name: string
  projectId: string
}

export interface TimeEntry {
  id: string
  hours: number
  description: string | null
  date: string
  projectId: string
  createdAt: string
}

export interface ProjectHealth {
  projectId: string
  projectName: string
  clientName: string
  score: number
  label: 'healthy' | 'at_risk' | 'critical' | 'completed'
  overdueTasks: number
  totalTasks: number
  completedTasks: number
}

export interface DashboardResponse {
  stats: {
    totalClients: number
    activeClients: number
    totalProjects: number
    activeProjects: number
    totalTasks: number
    pendingTasks: number
  }
  overdueTasks: Task[]
  projectsDueThisWeek: Project[]
  projectHealth: ProjectHealth[]
}

export interface SearchResult {
  id: string
  title: string
  subtitle: string
  href: string
  type: 'project' | 'task' | 'client' | 'bookmark'
  priority?: string
  status?: string
}

export interface MeResponse {
  userId: string
  plan: 'free' | 'pro' | 'team'
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  hasPortal: boolean
  usage: {
    projects: { current: number; limit: number }
    tasks: { current: number; limit: number }
    clients: { current: number; limit: number }
  }
}
