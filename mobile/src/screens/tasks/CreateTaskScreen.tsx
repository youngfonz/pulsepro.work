import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { X, ChevronDown, Check, Calendar } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useCreateTask } from '../../hooks/useTasks'
import { useProjects } from '../../hooks/useProjects'
import { VoiceMicButton } from '../../components/ui/VoiceMicButton'
import { parseTaskFromVoice } from '../../lib/voice'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { Project } from '../../types/api'

type Priority = 'low' | 'medium' | 'high'

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: colors.success },
  { value: 'medium', label: 'Medium', color: colors.warning },
  { value: 'high', label: 'High', color: colors.destructive },
]

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function CreateTaskScreen() {
  const navigation = useNavigation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Pick<Project, 'id' | 'name'> | null>(null)
  const [projectModalVisible, setProjectModalVisible] = useState(false)

  const createTask = useCreateTask()
  const { data: projectsData } = useProjects()
  const projects = projectsData?.projects ?? []

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  const handleClearDate = async () => {
    await Haptics.selectionAsync()
    setDueDate(null)
    setShowDatePicker(false)
  }

  const handlePrioritySelect = useCallback(async (value: Priority) => {
    await Haptics.selectionAsync()
    setPriority(value)
  }, [])

  const handleProjectSelect = useCallback(async (project: Pick<Project, 'id' | 'name'> | null) => {
    await Haptics.selectionAsync()
    setSelectedProject(project)
    setProjectModalVisible(false)
  }, [])

  const handleVoiceTranscript = useCallback((transcript: string) => {
    const parsed = parseTaskFromVoice(transcript)
    setTitle(parsed.title)
    if (parsed.description) setDescription(parsed.description)
    if (parsed.priority && ['low', 'medium', 'high'].includes(parsed.priority)) {
      setPriority(parsed.priority as Priority)
    }
    if (parsed.dueDate) {
      setDueDate(new Date(parsed.dueDate + 'T00:00:00'))
    }
  }, [])

  const canSubmit = title.trim().length > 0 && !createTask.isPending

  const handleCreate = async () => {
    if (!canSubmit) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const payload: Record<string, unknown> = {
      title: title.trim(),
    }
    if (description.trim()) payload.description = description.trim()
    if (priority) payload.priority = priority
    if (dueDate) payload.dueDate = toISODate(dueDate)
    if (selectedProject) payload.projectId = selectedProject.id

    createTask.mutate(payload, {
      onSuccess: () => {
        navigation.goBack()
      },
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="next"
                maxLength={200}
              />
              <VoiceMicButton onTranscript={handleVoiceTranscript} />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.chipRow}>
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = priority === option.value
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: option.color, borderColor: option.color },
                    ]}
                    onPress={() => handlePrioritySelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.chipDot, { backgroundColor: isSelected ? colors.surface : option.color }]} />
                    <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={async () => {
                await Haptics.selectionAsync()
                setShowDatePicker(!showDatePicker)
              }}
              activeOpacity={0.7}
            >
              <View style={styles.dateRow}>
                <Calendar size={18} color={dueDate ? colors.primary : colors.textSecondary} />
                <Text style={dueDate ? styles.selectorValue : styles.selectorPlaceholder}>
                  {dueDate ? formatDateDisplay(dueDate) : 'No due date'}
                </Text>
              </View>
              {dueDate ? (
                <TouchableOpacity onPress={handleClearDate} hitSlop={8} activeOpacity={0.7}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : (
                <ChevronDown size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate ?? new Date()}
                mode="date"
                display="inline"
                minimumDate={new Date()}
                onChange={handleDateChange}
                themeVariant="dark"
                accentColor={colors.primary}
                style={styles.datePicker}
              />
            )}
          </View>

          {/* Project */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Project</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setProjectModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedProject ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                {selectedProject ? selectedProject.name : 'No project'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mutation error */}
          {createTask.isError ? (
            <View style={styles.mutationError}>
              <Text style={styles.mutationErrorText}>
                {(createTask.error as Error)?.message ?? 'Failed to create task. Please try again.'}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, !canSubmit && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            {createTask.isPending ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.createButtonLabel}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Project Picker Modal */}
      <Modal
        visible={projectModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProjectModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <TouchableOpacity
              onPress={() => setProjectModalVisible(false)}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <X size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[null, ...projects] as (Project | null)[]}
            keyExtractor={(item) => item?.id ?? '__none__'}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const isSelected = item === null
                ? selectedProject === null
                : selectedProject?.id === item.id
              return (
                <TouchableOpacity
                  style={[styles.modalRow, isSelected && styles.modalRowSelected]}
                  onPress={() => handleProjectSelect(item ? { id: item.id, name: item.name } : null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalRowContent}>
                    <Text style={[styles.modalRowLabel, isSelected && styles.modalRowLabelSelected]}>
                      {item ? item.name : 'No project'}
                    </Text>
                    {item?.client ? (
                      <Text style={styles.modalRowSub}>{item.client.name}</Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Check size={18} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              )
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  required: { color: colors.destructive },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputFlex: { flex: 1 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  // Priority chips
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  chipLabelSelected: { color: colors.surface },

  // Project selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectorValue: { fontSize: 15, color: colors.textPrimary, flex: 1 },
  selectorPlaceholder: { fontSize: 15, color: colors.textSecondary, flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  datePicker: { marginTop: spacing.sm },

  // Mutation error banner
  mutationError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mutationErrorText: { fontSize: 14, color: colors.destructive },

  // Footer / Create button
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: { opacity: 0.45 },
  createButtonLabel: { fontSize: 16, fontWeight: '600', color: colors.surface },

  // Project picker modal
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  modalList: { padding: spacing.lg },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  modalRowSelected: { borderColor: colors.primary },
  modalRowContent: { flex: 1 },
  modalRowLabel: { fontSize: 15, color: colors.textPrimary },
  modalRowLabelSelected: { color: colors.primary, fontWeight: '500' },
  modalRowSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
})
