import React from 'react'
import { TouchableOpacity } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LayoutDashboard, FolderKanban, CheckSquare, Calendar, MoreHorizontal, ChevronLeft, X } from 'lucide-react-native'
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
import { SearchScreen } from '../screens/search/SearchScreen'
import { CreateInvoiceScreen } from '../screens/invoices/CreateInvoiceScreen'

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
  animation: 'slide_from_right' as const,
}

const modalOptions = {
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
}

const backButton = (navigation: any) => ({
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 8 }}>
      <ChevronLeft size={24} color={colors.primary} />
    </TouchableOpacity>
  ),
})

const closeButton = (navigation: any) => ({
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ marginRight: 8 }}>
      <X size={22} color={colors.textSecondary} />
    </TouchableOpacity>
  ),
})

const detailOptions = {
  animation: 'fade_from_bottom' as const,
}

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <DashboardStack.Screen name="CreateTask" component={CreateTaskScreen} options={({ navigation }) => ({ title: 'New Task', ...modalOptions, ...closeButton(navigation) })} />
      <DashboardStack.Screen name="CreateProject" component={CreateProjectScreen} options={({ navigation }) => ({ title: 'New Project', ...modalOptions, ...closeButton(navigation) })} />
      <DashboardStack.Screen name="CreateClient" component={CreateClientScreen} options={({ navigation }) => ({ title: 'New Client', ...modalOptions, ...closeButton(navigation) })} />
      <DashboardStack.Screen name="Search" component={SearchScreen} options={({ navigation }) => ({ title: 'Search', ...detailOptions, ...backButton(navigation) })} />
    </DashboardStack.Navigator>
  )
}

function ProjectsStackScreen() {
  return (
    <ProjectsStack.Navigator screenOptions={screenOptions}>
      <ProjectsStack.Screen name="ProjectsList" component={ProjectsListScreen} options={{ title: 'Projects' }} />
      <ProjectsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={({ navigation }) => ({ title: 'Project', ...detailOptions, ...backButton(navigation) })} />
      <ProjectsStack.Screen name="CreateProject" component={CreateProjectScreen} options={({ navigation }) => ({ title: 'New Project', ...modalOptions, ...closeButton(navigation) })} />
    </ProjectsStack.Navigator>
  )
}

function TasksStackScreen() {
  return (
    <TasksStack.Navigator screenOptions={screenOptions}>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: 'Tasks' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={({ navigation }) => ({ title: 'Task', ...detailOptions, ...backButton(navigation) })} />
      <TasksStack.Screen name="CreateTask" component={CreateTaskScreen} options={({ navigation }) => ({ title: 'New Task', ...modalOptions, ...closeButton(navigation) })} />
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
      <MoreStack.Screen name="ClientsList" component={ClientsListScreen} options={({ navigation }) => ({ title: 'Clients', ...backButton(navigation) })} />
      <MoreStack.Screen name="ClientDetail" component={ClientDetailScreen} options={({ navigation }) => ({ title: 'Client', ...detailOptions, ...backButton(navigation) })} />
      <MoreStack.Screen name="CreateClient" component={CreateClientScreen} options={({ navigation }) => ({ title: 'New Client', ...modalOptions, ...closeButton(navigation) })} />
      <MoreStack.Screen name="InvoicesList" component={InvoicesListScreen} options={({ navigation }) => ({ title: 'Invoices', ...backButton(navigation) })} />
      <MoreStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={({ navigation }) => ({ title: 'Invoice', ...detailOptions, ...backButton(navigation) })} />
      <MoreStack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={({ navigation }) => ({ title: 'New Invoice', ...modalOptions, ...closeButton(navigation) })} />
      <MoreStack.Screen name="Bookmarks" component={BookmarksScreen} options={({ navigation }) => ({ ...backButton(navigation) })} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={({ navigation }) => ({ ...backButton(navigation) })} />
    </MoreStack.Navigator>
  )
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingHorizontal: 12,
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
