import React from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Users, FileText, Bookmark, Settings } from 'lucide-react-native'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { MoreStackParamList } from '../../types/navigation'

type Props = { navigation: NativeStackNavigationProp<MoreStackParamList, 'More'> }

const menuItems = [
  { label: 'Clients', screen: 'ClientsList' as const, icon: Users },
  { label: 'Invoices', screen: 'InvoicesList' as const, icon: FileText },
  { label: 'Bookmarks', screen: 'Bookmarks' as const, icon: Bookmark },
  { label: 'Settings', screen: 'Settings' as const, icon: Settings },
]

export function MoreScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <item.icon size={22} color={colors.textPrimary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  menuLabel: { fontSize: 17, color: colors.textPrimary },
})
