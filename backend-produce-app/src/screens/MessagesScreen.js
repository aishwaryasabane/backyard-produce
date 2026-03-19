import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { mockConversations } from '../data/mockMessages';
import { colors, spacing, typography } from '../../theme';

function mapConversation(c) {
  const last = c.last_message ?? c.lastMessage;
  return {
    id: c.id,
    listingId: c.listing_id ?? c.listingId,
    listingTitle: c.listing_title ?? c.listingTitle,
    otherUser: c.other_user ?? c.otherUser ?? { id: '', name: '?' },
    lastMessage: last ? { text: last.text ?? last.body, time: last.time ?? '', fromMe: last.from_me ?? last.fromMe } : { text: 'No messages yet', time: '', fromMe: false },
  };
}

export default function MessagesScreen({ navigation }) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(!!token);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!token) {
      setConversations(mockConversations);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getConversations(token);
      setConversations((data ?? []).map(mapConversation));
    } catch (_) {
      setConversations(mockConversations);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        navigation.navigate('Chat', {
          listing: { id: item.listingId, title: item.listingTitle },
          conversationId: item.id,
          otherUser: item.otherUser,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.otherUser?.name?.[0] ?? '?'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{item.otherUser?.name ?? '?'}</Text>
        <Text style={styles.listingTitle}>{item.listingTitle}</Text>
        <Text style={styles.preview} numberOfLines={1}>{item.lastMessage?.text ?? ''}</Text>
      </View>
      <Text style={styles.time}>{item.lastMessage?.time ?? ''}</Text>
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
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            When you contact a seller from a listing, your conversation will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...typography.titleSmall, color: '#fff' },
  content: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.label, color: colors.text },
  listingTitle: { ...typography.caption, color: colors.primary, marginTop: 2 },
  preview: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
  time: { ...typography.caption, color: colors.textMuted },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.titleSmall, color: colors.text },
  emptyText: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
