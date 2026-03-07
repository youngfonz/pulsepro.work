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
import { X, ChevronDown, Check } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useCreateProject } from '../../hooks/useProjects'
import { useClients } from '../../hooks/useClients'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { Client } from '../../types/api'

type ProjectStatus = 'not_started' | 'in_progress'

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: colors.textSecondary },
  { value: 'in_progress', label: 'In Progress', color: colors.primary },
]

export function CreateProjectScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('in_progress')
  const [selectedClient, setSelectedClient] = useState<Pick<Client, 'id' | 'name' | 'company'> | null>(null)
  const [clientModalVisible, setClientModalVisible] = useState(false)

  const createProject = useCreateProject()
  const { data: clientsData } = useClients()
  const clients = clientsData?.clients ?? []

  const handleStatusSelect = useCallback(async (value: ProjectStatus) => {
    await Haptics.selectionAsync()
    setStatus(value)
  }, [])

  const handleClientSelect = useCallback(async (client: Pick<Client, 'id' | 'name' | 'company'> | null) => {
    await Haptics.selectionAsync()
    setSelectedClient(client)
    setClientModalVisible(false)
  }, [])

  const canSubmit = name.trim().length > 0 && !createProject.isPending

  const handleCreate = async () => {
    if (!canSubmit) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const payload: Record<string, unknown> = {
      name: name.trim(),
      status,
    }
    if (description.trim()) payload.description = description.trim()
    if (selectedClient) payload.clientId = selectedClient.id

    createProject.mutate(payload, {
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
          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="What are you working on?"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              maxLength={200}
            />
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

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((option) => {
                const isSelected = status === option.value
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: option.color, borderColor: option.color },
                    ]}
                    onPress={() => handleStatusSelect(option.value)}
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

          {/* Client */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Client</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setClientModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedClient ? styles.selectorValue : styles.selectorPlaceholder} numberOfLines={1}>
                {selectedClient ? selectedClient.name : 'No client'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mutation error */}
          {createProject.isError ? (
            <View style={styles.mutationError}>
              <Text style={styles.mutationErrorText}>
                {(createProject.error as Error)?.message ?? 'Failed to create project. Please try again.'}
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
            activeOpacity={0.8}
          >
            {createProject.isPending ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.createButtonLabel}>Create Project</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Client Picker Modal */}
      <Modal
        visible={clientModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setClientModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <TouchableOpacity
              onPress={() => setClientModalVisible(false)}
              hitSlop={8}
            >
              <X size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[null, ...clients] as (Client | null)[]}
            keyExtractor={(item) => item?.id ?? '__none__'}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const isSelected = item === null
                ? selectedClient === null
                : selectedClient?.id === item.id
              return (
                <TouchableOpacity
                  style={[styles.modalRow, isSelected && styles.modalRowSelected]}
                  onPress={() =>
                    handleClientSelect(
                      item ? { id: item.id, name: item.name, company: item.company } : null
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.modalRowContent}>
                    <Text style={[styles.modalRowLabel, isSelected && styles.modalRowLabelSelected]}>
                      {item ? item.name : 'No client'}
                    </Text>
                    {item?.company ? (
                      <Text style={styles.modalRowSub}>{item.company}</Text>
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

  // Status chips
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

  // Client selector
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

  // Client picker modal
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
