import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, spacing, borderRadius, typography } from '../../theme';

const statusColors = { confirmed: colors.primary, pending: colors.secondary, cancelled: colors.textMuted };

function mapPickup(p) {
  return {
    id: p.id,
    listingTitle: p.listing_title ?? p.listingTitle,
    sellerName: p.seller_name ?? p.sellerName,
    day: p.scheduled_day ?? p.day,
    time: p.scheduled_time ?? p.time,
    status: p.status ?? 'pending',
    location: p.location ?? '',
  };
}

export default function ScheduledPickupsScreen({ navigation }) {
  const { token } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPickups = useCallback(async () => {
    try {
      const data = await api.getMyPickups(token);
      setPickups((data ?? []).map(mapPickup));
    } catch (_) {
      setPickups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Chat', {
          listing: { title: item.listingTitle },
          conversationId: 'c1',
          otherUser: { name: item.sellerName },
        })
      }
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>{item.listingTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || colors.textMuted) + '22' }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] || colors.textMuted }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.seller}>{item.sellerName}</Text>
      <Text style={styles.datetime}>
        📅 {item.day} at {item.time}
      </Text>
      <Text style={styles.location}>📍 {item.location}</Text>
      <Text style={styles.messageHint}>Tap to message seller</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPickups(); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No pickups scheduled</Text>
            <Text style={styles.emptyText}>
              When you schedule a time with a seller, it will show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { ...typography.label, color: colors.text, flex: 1 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: { ...typography.caption, fontWeight: '600' },
  seller: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  datetime: { ...typography.bodySmall, color: colors.text, marginTop: 4 },
  location: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  messageHint: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.titleSmall, color: colors.text },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
