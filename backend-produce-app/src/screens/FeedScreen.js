import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import ListingCard from '../components/ListingCard';
import { api } from '../api/client';
import { PRODUCE_TYPES, mockListings } from '../data/mockListings';
import { colors, spacing, borderRadius, typography } from '../../theme';

const distanceOptions = ['Any', '0.5 km', '5 km', '20 km', '50 km'];
const priceOptions = ['Any', 'Free only', 'Under $2', 'Under $5', 'Any price'];

export default function FeedScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [produceFilter, setProduceFilter] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      let all = [];
      let nearby = [];
      try {
        all = await api.getAllListings(100) || [];
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const { coords } = await Location.getCurrentPositionAsync({});
            if (coords?.latitude != null && coords?.longitude != null) {
              nearby = await api.getNearbyListings({
                lat: coords.latitude,
                lng: coords.longitude,
                radius_km: 50,
                limit: 100,
              }) || [];
            }
          }
        } catch (_) {}
      } catch (_) {}
      const byId = new Map();
      all.forEach((l) => byId.set(l.id, l));
      nearby.forEach((l) => byId.set(l.id, l));
      // Always include mock listings (with produce images) so the feed never looks empty
      mockListings.forEach((l) => byId.set(l.id, l));
      const merged = Array.from(byId.values());
      merged.sort((a, b) => {
        const aHasImage = !!(a.image || a.image_url);
        const bHasImage = !!(b.image || b.image_url);
        if (aHasImage !== bHasImage) return aHasImage ? -1 : 1;
        const da = a.location?.distance ?? Infinity;
        const db = b.location?.distance ?? Infinity;
        if (da !== db) return da - db;
        return 0;
      });
      setListings(merged);
    } catch (_) {
      setListings(mockListings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filtered = useMemo(() => {
    let list = [...listings];
    const produce = produceFilter || null;
    if (produce) {
      list = list.filter((l) => (l.produce_type || l.produceType) === produce);
    }
    const maxDistKm = distanceFilter === 0 ? Infinity : parseFloat(distanceOptions[distanceFilter].split(' ')[0]);
    if (maxDistKm !== Infinity) {
      list = list.filter((l) => (l.location?.distance ?? 0) <= maxDistKm);
    }
    if (priceFilter === 1) list = list.filter((l) => (l.price_type || l.priceType) === 'free');
    if (priceFilter === 2) list = list.filter((l) => (l.price ?? 0) < 2);
    if (priceFilter === 3) list = list.filter((l) => (l.price ?? 0) < 5);
    return list;
  }, [listings, produceFilter, distanceFilter, priceFilter]);

  const renderItem = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('ListingDetail', { listing: item })}
    />
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
      <TouchableOpacity
        style={styles.filterBar}
        onPress={() => setShowFilters(!showFilters)}
        activeOpacity={0.8}
      >
        <Text style={styles.filterLabel}>Filters</Text>
        <Text style={styles.filterIcon}>{showFilters ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterSectionTitle}>Produce type</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !produceFilter && styles.chipActive]}
              onPress={() => setProduceFilter(null)}
            >
              <Text style={[styles.chipText, !produceFilter && styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            {PRODUCE_TYPES.slice(0, 6).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, produceFilter === t && styles.chipActive]}
                onPress={() => setProduceFilter(produceFilter === t ? null : t)}
              >
                <Text style={[styles.chipText, produceFilter === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterSectionTitle}>Distance</Text>
          <View style={styles.chipRow}>
            {distanceOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, distanceFilter === i && styles.chipActive]}
                onPress={() => setDistanceFilter(i)}
              >
                <Text style={[styles.chipText, distanceFilter === i && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterSectionTitle}>Price</Text>
          <View style={styles.chipRow}>
            {priceOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, priceFilter === i && styles.chipActive]}
                onPress={() => setPriceFilter(i)}
              >
                <Text style={[styles.chipText, priceFilter === i && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {listings.length === 0 ? 'No listings yet. Be the first to list produce!' : 'No listings match your filters. Try adjusting them.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: { ...typography.label, color: colors.text },
  filterIcon: { ...typography.caption, color: colors.textMuted },
  filterPanel: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSectionTitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#fff' },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
