import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { API_BASE_URL } from '../api/config';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { PRODUCE_TYPES } from '../data/mockListings';

const PRICE_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'per_lb', label: '$/lb' },
  { value: 'per_item', label: 'Per item' },
  { value: 'per_bunch', label: 'Per bunch' },
];

export default function CreateListingScreen({ route, navigation }) {
  const { token } = useAuth();
  const listingId = route.params?.listingId ?? null;
  const existingListing = route.params?.listing ?? null;

  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [produceType, setProduceType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [paymentCash, setPaymentCash] = useState(true);
  const [paymentCard, setPaymentCard] = useState(false);
  const [paymentBarter, setPaymentBarter] = useState(true);

  useEffect(() => {
    if (existingListing) {
      setProduceType(existingListing.produce_type || '');
      setTitle(existingListing.title || '');
      setDescription(existingListing.description || '');
      setQuantity(existingListing.quantity || '');
      setPriceType(existingListing.price_type || 'free');
      setPrice(String(existingListing.price ?? ''));
      setLocation(existingListing.location?.approximate || '');
      setImageUrl(existingListing.image || null);
      if (existingListing.payment_methods) {
        setPaymentCash(existingListing.payment_methods.includes('cash'));
        setPaymentCard(existingListing.payment_methods.includes('card'));
        setPaymentBarter(existingListing.payment_methods.includes('barter'));
      }
    }
  }, [existingListing]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to add a listing image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setImageUrl(null);
    }
  };

  const paymentMethods = [];
  if (paymentCash) paymentMethods.push('cash');
  if (paymentCard) paymentMethods.push('card');
  if (paymentBarter) paymentMethods.push('barter');

  const buildBody = (finalImageUrl) => ({
    produce_type: produceType,
    title,
    description: description || null,
    quantity: quantity || null,
    price: priceType === 'free' ? 0 : parseFloat(price) || 0,
    price_type: priceType,
    latitude: null,
    longitude: null,
    address_approximate: location || null,
    image_url: finalImageUrl || null,
    payment_methods: paymentMethods,
  });

  const handleSubmit = async () => {
    if (!produceType?.trim() || !title?.trim()) {
      Alert.alert('Missing info', 'Please fill in produce type and title.');
      return;
    }
    if (priceType !== 'free' && (!price || isNaN(parseFloat(price)))) {
      Alert.alert('Invalid price', 'Enter a valid price.');
      return;
    }
    setLoading(true);
    try {
      let finalImageUrl = imageUrl;
      if (photo) {
        const { url } = await api.uploadImage(photo, token);
        finalImageUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      }
      const body = buildBody(finalImageUrl);
      if (listingId) {
        await api.updateListing(listingId, body, token);
        Alert.alert('Updated', 'Your listing has been updated.');
      } else {
        await api.createListing(body, token);
        Alert.alert('Created', 'Your produce listing has been posted.');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Photo</Text>
      <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
        {photo || imageUrl ? (
          <Text style={styles.photoPlaceholderText}>{photo ? 'New image selected' : 'Image set'}</Text>
        ) : (
          <>
            <Text style={styles.photoEmoji}>📷</Text>
            <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Produce type</Text>
      <View style={styles.chipRow}>
        {PRODUCE_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, produceType === t && styles.chipActive]}
            onPress={() => setProduceType(t)}
          >
            <Text style={[styles.chipText, produceType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Fresh Valencia Oranges"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.sectionTitle}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="A few details about your produce..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.sectionTitle}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. ~20 lbs or 5 plants"
        placeholderTextColor={colors.textMuted}
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.sectionTitle}>Price</Text>
      <View style={styles.priceRow}>
        {PRICE_OPTIONS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, priceType === value && styles.chipActive]}
            onPress={() => setPriceType(value)}
          >
            <Text style={[styles.chipText, priceType === value && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
        {priceType !== 'free' && (
          <TextInput
            style={styles.priceInput}
            placeholder={priceType === 'per_lb' ? '2.50' : '10'}
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        )}
      </View>

      <Text style={styles.sectionTitle}>Pickup location (approximate)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Oak St & 3rd Ave"
        placeholderTextColor={colors.textMuted}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.sectionTitle}>Payment accepted</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, paymentCash && styles.toggleActive]}
          onPress={() => setPaymentCash(!paymentCash)}
        >
          <Text style={[styles.toggleText, paymentCash && styles.toggleTextActive]}>Cash</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, paymentCard && styles.toggleActive]}
          onPress={() => setPaymentCard(!paymentCard)}
        >
          <Text style={[styles.toggleText, paymentCard && styles.toggleTextActive]}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, paymentBarter && styles.toggleActive]}
          onPress={() => setPaymentBarter(!paymentBarter)}
        >
          <Text style={[styles.toggleText, paymentBarter && styles.toggleTextActive]}>Barter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Saving…' : listingId ? 'Update listing' : 'Post listing'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  photoBox: {
    height: 140,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: { fontSize: 36 },
  photoPlaceholderText: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#fff' },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  priceInput: {
    width: 80,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  toggleText: { ...typography.label, color: colors.text },
  toggleTextActive: { color: colors.primary },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitButtonText: { ...typography.button, color: '#fff' },
});
