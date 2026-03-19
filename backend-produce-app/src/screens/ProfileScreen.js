import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Neighbor'}</Text>
        <Text style={styles.email}>{user?.email ?? 'you@example.com'}</Text>
        <Text style={styles.neighborhood}>{user?.neighborhood ?? 'Your neighborhood'}</Text>
      </View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>➕</Text>
        <Text style={styles.menuText}>List your produce</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('MyListings')}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>📋</Text>
        <Text style={styles.menuText}>My listings</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('ScheduledPickups')}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>📅</Text>
        <Text style={styles.menuText}>Scheduled pickups</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('MyReviews')}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>⭐</Text>
        <Text style={styles.menuText}>My reviews</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },
  name: { ...typography.titleSmall, color: colors.text, marginTop: spacing.md },
  email: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },
  neighborhood: { ...typography.caption, color: colors.primary, marginTop: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuIcon: { fontSize: 22, marginRight: spacing.md },
  menuText: { flex: 1, ...typography.body, color: colors.text },
  menuArrow: { ...typography.body, color: colors.textMuted },
  logoutButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
  },
  logoutText: { ...typography.label, color: colors.error },
});
