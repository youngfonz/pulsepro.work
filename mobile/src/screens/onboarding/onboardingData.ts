export interface QuestionOption {
  id: string
  label: string
  icon: string
}

export interface Question {
  id: string
  title: string
  subtitle: string
  options: QuestionOption[]
  allowMultiple?: boolean
}

export interface TourStep {
  id: string
  title: string
  description: string
  visual: 'fab' | 'tabs' | 'pullrefresh' | 'ready'
}

export const questions: Question[] = [
  {
    id: 'role',
    title: 'What best describes you?',
    subtitle: "We'll tailor your experience",
    options: [
      { id: 'freelancer', label: 'Freelancer', icon: 'User' },
      { id: 'agency_owner', label: 'Agency owner', icon: 'Building2' },
      { id: 'team_lead', label: 'Team lead', icon: 'Users' },
      { id: 'other', label: 'Something else', icon: 'Sparkles' },
    ],
  },
  {
    id: 'team_size',
    title: 'How big is your team?',
    subtitle: 'Including yourself',
    options: [
      { id: 'solo', label: 'Just me', icon: 'User' },
      { id: 'small', label: '2–5 people', icon: 'Users' },
      { id: 'medium', label: '6–20 people', icon: 'Users' },
      { id: 'large', label: '20+ people', icon: 'Users' },
    ],
  },
]

export const tourSteps: TourStep[] = [
  {
    id: 'fab',
    title: 'Create anything, fast',
    description:
      "Tap the + button to add tasks, projects, or clients. It's always one tap away in the bottom-right corner.",
    visual: 'fab',
  },
  {
    id: 'tabs',
    title: 'Everything at your fingertips',
    description:
      'Switch between Dashboard, Projects, Tasks, Calendar, and More using the bottom tabs.',
    visual: 'tabs',
  },
  {
    id: 'ready',
    title: "You're all set",
    description:
      "Your dashboard shows what's due, what needs attention, and your recent activity. Start adding tasks and let Pulse Pro keep you on track.",
    visual: 'ready',
  },
]

export const TOTAL_STEPS = questions.length + tourSteps.length
