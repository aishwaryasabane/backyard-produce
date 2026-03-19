import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { mockReviewsForListing } from '../data/mockReviews';
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
  };
}

export default function ReviewsScreen({ route, navigation }) {
  const { listing } = route.params || {};
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!!listing?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitRating, setSubmitRating] = useState(5);
  const [submitText, setSubmitText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!listing?.id) {
      setReviews(mockReviewsForListing.map(mapReview));
      setLoading(false);
      return;
    }
    try {
      const data = await api.getReviewsForListing(listing.id);
      const list = (data && data.length) > 0 ? data.map(mapReview) : mockReviewsForListing.map(mapReview);
      setReviews(list);
    } catch (_) {
      setReviews(mockReviewsForListing.map(mapReview));
    } finally {
      setLoading(false);
    }
  }, [listing?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : (listing?.rating ?? 0);
  const count = reviews.length || (listing?.review_count ?? listing?.reviewCount ?? 0);

  const handleSubmitReview = async () => {
    if (!token || !listing?.id) {
      Alert.alert('Sign in', 'Please sign in to leave a review.');
      return;
    }
    setSubmitting(true);
    try {
      await api.addReview({ listingId: listing.id, rating: submitRating, text: submitText.trim() || null }, token);
      setShowForm(false);
      setSubmitRating(5);
      setSubmitText('');
      fetchReviews();
    } catch (e) {
      Alert.alert('Error', e.detail || e.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <Text style={styles.bigRating}>★ {avgRating}</Text>
        <Text style={styles.count}>{count} reviews</Text>
      </View>
      {token && (
        <TouchableOpacity style={styles.addReviewBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addReviewBtnText}>{showForm ? 'Cancel' : 'Write a review'}</Text>
        </TouchableOpacity>
      )}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setSubmitRating(n)}>
                <Text style={styles.starBtn}>{n <= submitRating ? '★' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.formLabel}>Comment (optional)</Text>
          <TextInput
            style={styles.input}
            value={submitText}
            onChangeText={setSubmitText}
            placeholder="How was your experience?"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview} disabled={submitting}>
            <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit review'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {reviews.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.author}>{r.author}</Text>
            <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
          </View>
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
  addReviewBtn: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addReviewBtnText: { ...typography.button, color: colors.primary, textAlign: 'center' },
  form: { marginBottom: spacing.lg },
  formLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  starBtn: { fontSize: 28, color: colors.secondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    ...typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  submitBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: 12 },
  submitBtnText: { ...typography.button, color: '#fff', textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { ...typography.label, color: colors.text },
  stars: { ...typography.caption, color: colors.secondary },
  body: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
