import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const { register, authError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(name, email, password, neighborhood || null);
    } catch (_) {
      // authError is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join your neighborhood produce community.</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Neighborhood / area</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Oak Street"
            placeholderTextColor={colors.textMuted}
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
          {authError ? (
            <Text style={styles.errorText}>{authError}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Creating account…' : 'Sign up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl },
  header: { marginBottom: spacing.xl },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  form: { width: '100%' },
  label: { ...typography.label, color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: { ...typography.button, color: '#fff' },
  linkButton: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
  linkText: { ...typography.bodySmall, color: colors.primary },
  errorText: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
});
