import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LayoutDashboard, FolderKanban, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react-native'
import { colors } from '../theme/colors'

import { DashboardScreen } from '../screens/dashboard/DashboardScreen'
import { ProjectsListScreen } from '../screens/projects/ProjectsListScreen'
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen'
import { TasksListScreen } from '../screens/tasks/TasksListScreen'
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen'
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen'
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen'
import { CreateClientScreen } from '../screens/clients/CreateClientScreen'
import { CalendarScreen } from '../screens/calendar/CalendarScreen'
import { MoreScreen } from '../screens/more/MoreScreen'
import { ClientsListScreen } from '../screens/clients/ClientsListScreen'
import { ClientDetailScreen } from '../screens/clients/ClientDetailScreen'
import { InvoicesListScreen } from '../screens/invoices/InvoicesListScreen'
import { InvoiceDetailScreen } from '../screens/invoices/InvoiceDetailScreen'
import { BookmarksScreen } from '../screens/bookmarks/BookmarksScreen'
import { SettingsScreen } from '../screens/settings/SettingsScreen'

import type {
  TabParamList,
  DashboardStackParamList,
  ProjectsStackParamList,
  TasksStackParamList,
  CalendarStackParamList,
  MoreStackParamList,
} from '../types/navigation'

const Tab = createBottomTabNavigator<TabParamList>()
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>()
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>()
const TasksStack = createNativeStackNavigator<TasksStackParamList>()
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>()
const MoreStack = createNativeStackNavigator<MoreStackParamList>()

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
}

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
      <DashboardStack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'New Task' }} />
      <DashboardStack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'New Project' }} />
      <DashboardStack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'New Client' }} />
    </DashboardStack.Navigator>
  )
}

function ProjectsStackScreen() {
  return (
    <ProjectsStack.Navigator screenOptions={screenOptions}>
      <ProjectsStack.Screen name="ProjectsList" component={ProjectsListScreen} options={{ title: 'Projects' }} />
      <ProjectsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
      <ProjectsStack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'New Project' }} />
    </ProjectsStack.Navigator>
  )
}

function TasksStackScreen() {
  return (
    <TasksStack.Navigator screenOptions={screenOptions}>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: 'Tasks' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task' }} />
      <TasksStack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'New Task' }} />
    </TasksStack.Navigator>
  )
}

function CalendarStackScreen() {
  return (
    <CalendarStack.Navigator screenOptions={screenOptions}>
      <CalendarStack.Screen name="Calendar" component={CalendarScreen} />
    </CalendarStack.Navigator>
  )
}

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="More" component={MoreScreen} />
      <MoreStack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clients' }} />
      <MoreStack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Client' }} />
      <MoreStack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'New Client' }} />
      <MoreStack.Screen name="InvoicesList" component={InvoicesListScreen} options={{ title: 'Invoices' }} />
      <MoreStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice' }} />
      <MoreStack.Screen name="Bookmarks" component={BookmarksScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  )
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingLeft: 10,
          paddingRight: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackScreen}
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => <FolderKanban size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksStackScreen}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackScreen}
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
