import React, { useState, useRef } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Animated, Pressable } from 'react-native'
import { Plus, CheckSquare, FolderKanban, Users, Mic } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { VoiceInputOverlay } from './VoiceInputOverlay'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'

interface SpeedDialAction {
  label: string
  icon: React.ReactNode
  onPress: () => void
}

interface SpeedDialFABProps {
  onAddTask: () => void
  onAddProject: () => void
  onAddClient: () => void
  onVoiceCreate?: (transcript: string) => void
}

export function SpeedDialFAB({ onAddTask, onAddProject, onAddClient, onVoiceCreate }: SpeedDialFABProps) {
  const [open, setOpen] = useState(false)
  const [voiceVisible, setVoiceVisible] = useState(false)
  const anim = useRef(new Animated.Value(0)).current

  const toggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const toValue = open ? 0 : 1
    Animated.spring(anim, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start()
    setOpen(!open)
  }

  const handleAction = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }).start()
    setOpen(false)
    action()
  }

  const actions: SpeedDialAction[] = [
    { label: 'New Client', icon: <Users size={18} color={colors.primary} />, onPress: onAddClient },
    { label: 'New Project', icon: <FolderKanban size={18} color={colors.primary} />, onPress: onAddProject },
    { label: 'New Task', icon: <CheckSquare size={18} color={colors.primary} />, onPress: onAddTask },
  ]

  const rotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <>
      {open && (
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggle} />
        </Animated.View>
      )}
      <View style={styles.container} pointerEvents="box-none">
        {actions.map((action, index) => {
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -((index + 1) * 52 + 16)],
          })
          const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          })
          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          })

          return (
            <Animated.View
              key={action.label}
              style={[
                styles.actionRow,
                { transform: [{ translateY }, { scale }], opacity },
              ]}
            >
              <TouchableOpacity
                style={styles.actionLabel}
                onPress={() => handleAction(action.onPress)}
                activeOpacity={0.8}
              >
                {action.icon}
                <Text style={styles.actionLabelText}>{action.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
        <Pressable
          style={styles.fab}
          onPress={toggle}
          onLongPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            setVoiceVisible(true)
          }}
          delayLongPress={500}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={26} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>

      <VoiceInputOverlay
        visible={voiceVisible}
        onClose={() => setVoiceVisible(false)}
        onResult={(transcript) => {
          if (onVoiceCreate) {
            onVoiceCreate(transcript)
          }
        }}
        entityType="task"
      />
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 98,
  },
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    paddingRight: spacing.xl,
    zIndex: 99,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  actionRow: {
    position: 'absolute',
    bottom: 0,
    right: spacing.xl,
  },
  actionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})
