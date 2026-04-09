export type RootStackParamList = {
  Auth: undefined
  Onboarding: undefined
  Main: undefined
}

export type AuthStackParamList = {
  Login: undefined
  SignUp: undefined
}

export type TabParamList = {
  DashboardTab: undefined
  ProjectsTab: undefined
  TasksTab: undefined
  CalendarTab: undefined
  MoreTab: undefined
}

export type DashboardStackParamList = {
  Dashboard: undefined
  CreateTask: undefined
  CreateProject: undefined
  CreateClient: undefined
  Search: undefined
}

export type ProjectsStackParamList = {
  ProjectsList: undefined
  ProjectDetail: { id: string }
  CreateProject: undefined
}

export type TasksStackParamList = {
  TasksList: undefined
  TaskDetail: { id: string }
  CreateTask: undefined
}

export type CalendarStackParamList = {
  Calendar: undefined
}

export type MoreStackParamList = {
  More: undefined
  ClientsList: undefined
  ClientDetail: { id: string }
  CreateClient: undefined
  InvoicesList: undefined
  InvoiceDetail: { id: string }
  CreateInvoice: undefined
  Bookmarks: undefined
  Settings: undefined
}
