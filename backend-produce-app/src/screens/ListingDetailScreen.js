import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { API_BASE_URL } from '../api/config';
import { colors, spacing, borderRadius, typography } from '../../theme';

const paymentLabels = { cash: 'Cash', card: 'Card', barter: 'Barter' };
const paymentColors = { cash: colors.cash, card: colors.cardPayment, barter: colors.barter };

function fullImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

export default function ListingDetailScreen({ route, navigation }) {
  const { token } = useAuth();
  const { listing: initialListing, listingId } = route.params || {};
  const id = listingId || initialListing?.id;
  const [listing, setListing] = useState(initialListing ?? null);
  const [loading, setLoading] = useState(!!id && !initialListing);

  useEffect(() => {
    if (!id) return;
    if (!initialListing) {
      api.getListing(id, token).then(setListing).catch(() => setListing(null)).finally(() => setLoading(false));
    } else if (token) {
      api.getListing(id, token).then(setListing).catch(() => {});
    }
  }, [id, initialListing, token]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Listing not found.</Text>
      </View>
    );
  }

  const priceText =
    listing.price_type === 'free'
      ? 'Free'
      : listing.price_type === 'per_lb'
        ? `$${listing.price} per lb`
        : `$${listing.price}`;
  const sellerContact = listing.seller_contact;
  const imageUri = fullImageUrl(listing.image);

  const handleEmailSeller = () => {
    if (sellerContact?.email) {
      Linking.openURL(`mailto:${sellerContact.email}`);
    } else {
      Alert.alert('Contact', 'Log in to see the seller\'s contact information.');
    }
  };

  const handleMessageSeller = async () => {
    if (!token) {
      navigation.navigate('Chat', {
        listing,
        conversationId: 'c1',
        otherUser: { name: listing.seller_name ?? listing.sellerName ?? 'Seller' },
      });
      return;
    }
    try {
      const conv = await api.createOrGetConversation(listing.id, token);
      navigation.navigate('Chat', {
        listing: { id: listing.id, title: listing.title },
        conversationId: conv.id,
        otherUser: conv.other_user ?? conv.otherUser,
      });
    } catch (e) {
      Alert.alert('Error', e.detail || e.message || 'Could not start conversation.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imagePlaceholder}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imageEmoji}>🥬</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.produceType}>{listing.produce_type}</Text>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.description}>{listing.description || '—'}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{listing.quantity || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={[styles.value, listing.price_type === 'free' && { color: colors.primary }]}>
            {priceText}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{listing.location?.approximate ?? '—'}</Text>
        </View>
        {listing.location?.distance != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>~{listing.location.distance} km away</Text>
          </View>
        )}
        <Text style={styles.sectionTitle}>Payment accepted</Text>
        <View style={styles.paymentRow}>
          {(listing.payment_methods || []).map((p) => (
            <View key={p} style={[styles.paymentChip, { backgroundColor: paymentColors[p] + '22' }]}>
              <Text style={[styles.paymentText, { color: paymentColors[p] }]}>{paymentLabels[p]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sellerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{listing.seller_name?.[0] ?? '?'}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{listing.seller_name}</Text>
            {listing.rating != null && (
              <TouchableOpacity onPress={() => navigation.navigate('Reviews', { listing })}>
                <Text style={styles.rating}>★ {listing.rating} ({listing.review_count} reviews)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {sellerContact?.email && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSeller} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Email seller</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={sellerContact?.email ? styles.secondaryButton : styles.primaryButton}
          onPress={handleMessageSeller}
          activeOpacity={0.8}
        >
          <Text style={sellerContact?.email ? styles.secondaryButtonText : styles.primaryButtonText}>Message seller</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SchedulePickup', { listing })}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Schedule pickup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { ...typography.body, color: colors.error },
  imagePlaceholder: {
    height: 220,
    backgroundColor: colors.primary + '25',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageEmoji: { fontSize: 72 },
  body: { padding: spacing.lg },
  produceType: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { ...typography.titleSmall, color: colors.text, marginTop: 4 },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: { ...typography.label, color: colors.textMuted },
  value: { ...typography.body, color: colors.text },
  sectionTitle: { ...typography.label, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
  paymentRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  paymentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  paymentText: { ...typography.label },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...typography.titleSmall, color: '#fff' },
  sellerInfo: { marginLeft: spacing.md },
  sellerName: { ...typography.label, color: colors.text },
  rating: { ...typography.caption, color: colors.primary, marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: { ...typography.button, color: '#fff' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: { ...typography.button, color: colors.primary },
});
