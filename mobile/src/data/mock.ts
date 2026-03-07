import type { DashboardResponse, Project, Task, Client, Invoice } from '../types/api'

const now = new Date().toISOString()
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString()

export const mockDashboard: DashboardResponse = {
  stats: {
    totalClients: 5,
    activeClients: 3,
    totalProjects: 8,
    activeProjects: 4,
    totalTasks: 24,
    pendingTasks: 12,
  },
  overdueTasks: [
    {
      id: 'mock-t1', title: 'Review brand guidelines', description: null, notes: null,
      status: 'in_progress', priority: 'high', startDate: null, dueDate: yesterday,
      url: null, bookmarkType: null, thumbnailUrl: null, tags: ['design'],
      projectId: 'mock-p1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
      project: { id: 'mock-p1', name: 'Website Redesign' },
    },
    {
      id: 'mock-t2', title: 'Finalize Q1 report', description: null, notes: null,
      status: 'todo', priority: 'medium', startDate: null, dueDate: lastWeek,
      url: null, bookmarkType: null, thumbnailUrl: null, tags: [],
      projectId: 'mock-p2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
      project: { id: 'mock-p2', name: 'Marketing Campaign' },
    },
  ],
  projectsDueThisWeek: [],
  projectHealth: [
    { projectId: 'mock-p1', projectName: 'Website Redesign', clientName: 'Acme Corp', score: 85, label: 'healthy', overdueTasks: 1, totalTasks: 8, completedTasks: 5 },
    { projectId: 'mock-p2', projectName: 'Marketing Campaign', clientName: 'Globex Inc', score: 52, label: 'at_risk', overdueTasks: 3, totalTasks: 6, completedTasks: 2 },
    { projectId: 'mock-p3', projectName: 'Mobile App MVP', clientName: 'StartupXYZ', score: 92, label: 'healthy', overdueTasks: 0, totalTasks: 10, completedTasks: 8 },
  ],
}

export const mockProjects: Project[] = [
  {
    id: 'mock-p1', name: 'Website Redesign', description: 'Full redesign of corporate site', notes: null,
    status: 'active', priority: 'high', dueDate: nextWeek, budget: 15000, hourlyRate: 150,
    clientId: 'mock-c1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c1', name: 'Acme Corp' }, _count: { tasks: 8 },
  },
  {
    id: 'mock-p2', name: 'Marketing Campaign', description: 'Q1 digital campaign', notes: null,
    status: 'active', priority: 'medium', dueDate: nextWeek, budget: 8000, hourlyRate: 120,
    clientId: 'mock-c2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c2', name: 'Globex Inc' }, _count: { tasks: 6 },
  },
  {
    id: 'mock-p3', name: 'Mobile App MVP', description: 'React Native iOS app', notes: null,
    status: 'active', priority: 'high', dueDate: null, budget: 25000, hourlyRate: 175,
    clientId: 'mock-c3', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c3', name: 'StartupXYZ' }, _count: { tasks: 10 },
  },
  {
    id: 'mock-p4', name: 'Brand Identity', description: 'Logo and brand book', notes: null,
    status: 'completed', priority: 'low', dueDate: lastWeek, budget: 5000, hourlyRate: 100,
    clientId: 'mock-c1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c1', name: 'Acme Corp' }, _count: { tasks: 4 },
  },
]

export const mockTasks: Task[] = [
  {
    id: 'mock-t1', title: 'Review brand guidelines', description: null, notes: null,
    status: 'in_progress', priority: 'high', startDate: null, dueDate: yesterday,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: ['design'],
    projectId: 'mock-p1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p1', name: 'Website Redesign', client: { id: 'mock-c1', name: 'Acme Corp' } },
  },
  {
    id: 'mock-t2', title: 'Finalize Q1 report', description: null, notes: null,
    status: 'todo', priority: 'medium', startDate: null, dueDate: lastWeek,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: [],
    projectId: 'mock-p2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p2', name: 'Marketing Campaign', client: { id: 'mock-c2', name: 'Globex Inc' } },
  },
  {
    id: 'mock-t3', title: 'Set up CI/CD pipeline', description: null, notes: null,
    status: 'done', priority: 'high', startDate: null, dueDate: null,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: ['devops'],
    projectId: 'mock-p3', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p3', name: 'Mobile App MVP', client: { id: 'mock-c3', name: 'StartupXYZ' } },
  },
  {
    id: 'mock-t4', title: 'Design onboarding screens', description: null, notes: null,
    status: 'in_progress', priority: 'medium', startDate: null, dueDate: nextWeek,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: ['design', 'mobile'],
    projectId: 'mock-p3', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p3', name: 'Mobile App MVP', client: { id: 'mock-c3', name: 'StartupXYZ' } },
  },
  {
    id: 'mock-t5', title: 'Write email copy for launch', description: null, notes: null,
    status: 'todo', priority: 'low', startDate: null, dueDate: nextWeek,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: ['content'],
    projectId: 'mock-p2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p2', name: 'Marketing Campaign', client: { id: 'mock-c2', name: 'Globex Inc' } },
  },
  {
    id: 'mock-t6', title: 'Create wireframes for homepage', description: null, notes: null,
    status: 'done', priority: 'high', startDate: null, dueDate: lastWeek,
    url: null, bookmarkType: null, thumbnailUrl: null, tags: ['design'],
    projectId: 'mock-p1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p1', name: 'Website Redesign', client: { id: 'mock-c1', name: 'Acme Corp' } },
  },
]

export const mockClients: Client[] = [
  {
    id: 'mock-c1', name: 'Acme Corp', email: 'hello@acme.com', phone: '(555) 123-4567',
    company: 'Acme Corporation', logo: null, status: 'active', notes: null,
    userId: 'u1', createdAt: lastWeek, updatedAt: now,
  },
  {
    id: 'mock-c2', name: 'Globex Inc', email: 'contact@globex.io', phone: '(555) 987-6543',
    company: 'Globex Industries', logo: null, status: 'active', notes: null,
    userId: 'u1', createdAt: lastWeek, updatedAt: now,
  },
  {
    id: 'mock-c3', name: 'StartupXYZ', email: 'team@startupxyz.com', phone: null,
    company: 'StartupXYZ Inc', logo: null, status: 'active', notes: null,
    userId: 'u1', createdAt: lastWeek, updatedAt: now,
  },
]

export const mockBookmarks: Task[] = [
  {
    id: 'mock-b1', title: 'Figma Design System', description: null, notes: null,
    status: 'in_progress', priority: 'high', startDate: null, dueDate: null,
    url: 'https://figma.com/file/abc123', bookmarkType: 'figma', thumbnailUrl: null, tags: ['design'],
    projectId: 'mock-p1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p1', name: 'Website Redesign', client: { id: 'mock-c1', name: 'Acme Corp' } },
  },
  {
    id: 'mock-b2', title: 'Stripe API Docs', description: null, notes: null,
    status: 'todo', priority: 'medium', startDate: null, dueDate: null,
    url: 'https://docs.stripe.com/api', bookmarkType: 'link', thumbnailUrl: null, tags: ['dev'],
    projectId: 'mock-p3', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p3', name: 'Mobile App MVP', client: { id: 'mock-c3', name: 'StartupXYZ' } },
  },
  {
    id: 'mock-b3', title: 'Brand Mood Board', description: null, notes: null,
    status: 'done', priority: 'low', startDate: null, dueDate: null,
    url: 'https://pinterest.com/boards/brand', bookmarkType: 'link', thumbnailUrl: null, tags: ['design'],
    projectId: 'mock-p4', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p4', name: 'Brand Identity', client: { id: 'mock-c1', name: 'Acme Corp' } },
  },
  {
    id: 'mock-b4', title: 'Campaign Analytics Sheet', description: null, notes: null,
    status: 'in_progress', priority: 'medium', startDate: null, dueDate: null,
    url: 'https://docs.google.com/spreadsheets/d/abc', bookmarkType: 'google', thumbnailUrl: null, tags: ['analytics'],
    projectId: 'mock-p2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    project: { id: 'mock-p2', name: 'Marketing Campaign', client: { id: 'mock-c2', name: 'Globex Inc' } },
  },
]

export const mockMe = {
  userId: 'u1',
  plan: 'pro' as const,
  status: 'active',
  currentPeriodEnd: nextWeek,
  cancelAtPeriodEnd: false,
  hasPortal: true,
  usage: {
    projects: { current: 4, limit: -1 },
    tasks: { current: 24, limit: -1 },
    clients: { current: 3, limit: -1 },
  },
}

export const mockInvoices: Invoice[] = [
  {
    id: 'mock-i1', number: 'INV-001', status: 'sent', dueDate: nextWeek,
    taxRate: 0, notes: null, fromName: 'Fonz', fromEmail: 'fonz@pulsepro.org',
    fromAddress: null, shareToken: 'abc123', paidAt: null,
    clientId: 'mock-c1', projectId: 'mock-p1', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c1', name: 'Acme Corp' },
    project: { id: 'mock-p1', name: 'Website Redesign' },
    subtotal: 4500, total: 4500,
    items: [
      { id: 'ii1', description: 'Design work — 30 hours', quantity: 30, rate: 150, amount: 4500, invoiceId: 'mock-i1' },
    ],
  },
  {
    id: 'mock-i2', number: 'INV-002', status: 'paid', dueDate: lastWeek,
    taxRate: 0, notes: null, fromName: 'Fonz', fromEmail: 'fonz@pulsepro.org',
    fromAddress: null, shareToken: 'def456', paidAt: lastWeek,
    clientId: 'mock-c2', projectId: 'mock-p2', userId: 'u1', createdAt: lastWeek, updatedAt: now,
    client: { id: 'mock-c2', name: 'Globex Inc' },
    project: { id: 'mock-p2', name: 'Marketing Campaign' },
    subtotal: 2400, total: 2400,
    items: [
      { id: 'ii2', description: 'Campaign strategy — 20 hours', quantity: 20, rate: 120, amount: 2400, invoiceId: 'mock-i2' },
    ],
  },
  {
    id: 'mock-i3', number: 'INV-003', status: 'draft', dueDate: nextWeek,
    taxRate: 8.5, notes: null, fromName: 'Fonz', fromEmail: 'fonz@pulsepro.org',
    fromAddress: null, shareToken: 'ghi789', paidAt: null,
    clientId: 'mock-c3', projectId: 'mock-p3', userId: 'u1', createdAt: now, updatedAt: now,
    client: { id: 'mock-c3', name: 'StartupXYZ' },
    project: { id: 'mock-p3', name: 'Mobile App MVP' },
    subtotal: 8750, total: 9493.75,
    items: [
      { id: 'ii3', description: 'Development — 50 hours', quantity: 50, rate: 175, amount: 8750, invoiceId: 'mock-i3' },
    ],
  },
]
