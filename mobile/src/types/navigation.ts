export type RootStackParamList = {
  Auth: undefined
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
}

export type ProjectsStackParamList = {
  ProjectsList: undefined
  ProjectDetail: { id: string }
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
  InvoicesList: undefined
  InvoiceDetail: { id: string }
  Bookmarks: undefined
  Settings: undefined
}
