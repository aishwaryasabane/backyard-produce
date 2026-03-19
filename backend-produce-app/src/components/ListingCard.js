import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { colors, spacing, borderRadius, typography } from '../../theme';

function listingField(listing, camel, snake) {
  return listing[camel] ?? listing[snake];
}

export default function ListingCard({ listing, onPress }) {
  const priceType = listingField(listing, 'priceType', 'price_type');
  const priceText =
    priceType === 'free'
      ? 'Free'
      : priceType === 'per_lb'
        ? `$${listing.price}/lb`
        : `$${listing.price}`;

  const paymentLabels = {
    cash: 'Cash',
    card: 'Card',
    barter: 'Barter',
  };
  const paymentColors = { cash: colors.cash, card: colors.cardPayment, barter: colors.barter };

  const produceType = listingField(listing, 'produceType', 'produce_type');
  const sellerName = listingField(listing, 'sellerName', 'seller_name');
  const paymentMethods = listing.paymentMethods ?? listing.payment_methods ?? [];
  const location = listing.location || {};
  const rawImage = listingField(listing, 'image', 'image_url');
  const imageUri = rawImage
    ? (typeof rawImage === 'string' && rawImage.startsWith('http') ? rawImage : `${API_BASE_URL}${rawImage}`)
    : null;

  const [imageError, setImageError] = React.useState(false);
  React.useEffect(() => setImageError(false), [listing.id, imageUri]);
  const showImage = imageUri && !imageError;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imagePlaceholder}>
        {showImage ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={styles.imageEmoji}>🥬</Text>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.produceType}>{produceType}</Text>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.seller}>{sellerName}</Text>
          {location.distance != null && (
            <Text style={styles.distance}> · {location.distance} km</Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, priceType === 'free' && styles.priceFree]}>
            {priceText}
          </Text>
          <View style={styles.paymentRow}>
            {paymentMethods.map((p) => (
              <View key={p} style={[styles.paymentChip, { backgroundColor: paymentColors[p] + '22' }]}>
                <Text style={[styles.paymentText, { color: paymentColors[p] }]}>
                  {paymentLabels[p]}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {(listing.rating != null || listing.review_count != null) && (
          <Text style={styles.rating}>★ {listing.rating ?? 0} ({listing.reviewCount ?? listing.review_count ?? 0})</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%' },
  imageEmoji: { fontSize: 36 },
  content: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  produceType: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { ...typography.label, color: colors.text, marginTop: 2 },
  meta: { flexDirection: 'row', marginTop: 4 },
  seller: { ...typography.bodySmall, color: colors.textSecondary },
  distance: { ...typography.bodySmall, color: colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: { ...typography.label, color: colors.text },
  priceFree: { color: colors.primary },
  paymentRow: { flexDirection: 'row', gap: 4 },
  paymentChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  paymentText: { ...typography.caption, fontWeight: '600' },
  rating: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
