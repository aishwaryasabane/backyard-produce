import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, spacing, borderRadius, typography } from '../../theme';

const DAYS = ['Today', 'Tomorrow', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

export default function SchedulePickupScreen({ route, navigation }) {
  const { token } = useAuth();
  const { listing } = route.params || {};
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedDay || !selectedSlot || !listing?.id) return;
    setLoading(true);
    try {
      await api.schedulePickup(
        { listingId: listing.id, scheduled_day: selectedDay, scheduled_time: selectedSlot },
        token
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.detail || e.message || 'Could not schedule pickup.');
    } finally {
      setLoading(false);
    }
  };

  const sellerName = listing?.seller_name ?? listing?.sellerName ?? 'Seller';
  const locationApprox = listing?.location?.approximate ?? '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {listing && (
        <View style={styles.listingCard}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingMeta}>{sellerName} · {locationApprox}</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Choose day</Text>
      <View style={styles.slotRow}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.slot, selectedDay === day && styles.slotActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.slotText, selectedDay === day && styles.slotTextActive]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Choose time</Text>
      <View style={styles.slotRow}>
        {SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[styles.slot, selectedSlot === slot && styles.slotActive]}
            onPress={() => setSelectedSlot(slot)}
          >
            <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.note}>
        The seller will be notified. They can confirm or suggest another time via message.
      </Text>
      <TouchableOpacity
        style={[styles.confirmBtn, (!selectedDay || !selectedSlot || loading) && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        disabled={!selectedDay || !selectedSlot || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmBtnText}>Request pickup time</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  listingCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  listingTitle: { ...typography.label, color: colors.text },
  listingMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { ...typography.bodySmall, color: colors.text },
  slotTextActive: { color: '#fff' },
  note: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { ...typography.button, color: '#fff' },
});
