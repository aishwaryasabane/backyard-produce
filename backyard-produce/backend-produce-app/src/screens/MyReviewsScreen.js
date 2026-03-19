import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { mockReviewsReceived } from '../data/mockReviews';
import { colors, spacing, typography } from '../../theme';

function formatReviewDate(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  const now = new Date();
  const days = Math.floor((now - d) / (24 * 60 * 60 * 1000));
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function mapReview(r) {
  return {
    id: r.id,
    author: r.author ?? r.reviewer_name,
    rating: r.rating ?? 5,
    text: r.text ?? '',
    date: r.date ?? formatReviewDate(r.created_at),
    listingContext: r.listing_title ?? r.listingContext ?? '',
  };
}

export default function MyReviewsScreen() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!!token);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!token) {
      setReviews(mockReviewsReceived.map(mapReview));
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMyReviews(token);
      const list = (data && data.length) > 0 ? data.map(mapReview) : mockReviewsReceived.map(mapReview);
      setReviews(list);
    } catch (_) {
      setReviews(mockReviewsReceived.map(mapReview));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReviews(); }} />}
    >
      <View style={styles.summary}>
        <Text style={styles.bigRating}>★ {avgRating}</Text>
        <Text style={styles.count}>Your seller rating</Text>
      </View>
      <Text style={styles.sectionTitle}>Reviews you received</Text>
      {reviews.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.author}>{r.author}</Text>
            <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
          </View>
          {r.listingContext ? <Text style={styles.listingContext}>{r.listingContext}</Text> : null}
          {r.text ? <Text style={styles.body}>{r.text}</Text> : null}
          <Text style={styles.date}>{r.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centered: { justifyContent: 'center', alignItems: 'center' },
  summary: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  bigRating: { ...typography.title, fontSize: 32, color: colors.primary },
  count: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { ...typography.label, color: colors.text },
  stars: { ...typography.caption, color: colors.secondary },
  listingContext: { ...typography.caption, color: colors.primary, marginTop: 2 },
  body: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
