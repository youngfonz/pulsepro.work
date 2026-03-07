import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useCreateClient } from '../../hooks/useClients'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

export function CreateClientScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')

  const createClient = useCreateClient()

  const canSubmit = name.trim().length > 0 && !createClient.isPending

  const handleCreate = async () => {
    if (!canSubmit) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const payload: Record<string, string> = {
      name: name.trim(),
    }
    if (email.trim()) payload.email = email.trim()
    if (phone.trim()) payload.phone = phone.trim()
    if (company.trim()) payload.company = company.trim()

    createClient.mutate(payload, {
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
            <Text style={styles.sectionLabel}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Client name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              maxLength={200}
            />
          </View>

          {/* Email */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="client@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              maxLength={320}
            />
          </View>

          {/* Phone */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              maxLength={50}
            />
          </View>

          {/* Company */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Company</Text>
            <TextInput
              style={styles.input}
              placeholder="Company or organization"
              placeholderTextColor={colors.textSecondary}
              value={company}
              onChangeText={setCompany}
              returnKeyType="done"
              maxLength={200}
            />
          </View>

          {/* Mutation error */}
          {createClient.isError ? (
            <View style={styles.mutationError}>
              <Text style={styles.mutationErrorText}>
                {(createClient.error as Error)?.message ?? 'Failed to create client. Please try again.'}
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
            {createClient.isPending ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.createButtonLabel}>Create Client</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
})
