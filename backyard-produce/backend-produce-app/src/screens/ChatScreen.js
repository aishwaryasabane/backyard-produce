import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { mockMessages } from '../data/mockMessages';
import { colors, spacing, borderRadius, typography } from '../../theme';

function mapMessage(m) {
  return {
    id: m.id,
    text: m.body ?? m.text,
    time: m.time ?? '',
    fromMe: m.from_me ?? m.fromMe ?? false,
  };
}

export default function ChatScreen({ route }) {
  const { token } = useAuth();
  const { conversationId, otherUser = { name: 'Seller' }, listing } = route.params || {};
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(!!conversationId && !!token);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!token || !conversationId) {
      const mock = mockMessages[conversationId] || mockMessages.c1 || [];
      setMessages(mock.map((m) => ({ ...m, id: m.id || Math.random().toString() })));
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMessages(conversationId, token);
      setMessages((data ?? []).map(mapMessage));
    } catch (_) {
      setMessages((mockMessages[conversationId] || mockMessages.c1 || []).map((m) => ({ ...m, id: m.id || Math.random().toString() })));
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    if (!token || !conversationId) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text, time: 'Now', fromMe: true }]);
      setInput('');
      return;
    }
    setSending(true);
    try {
      const sent = await api.sendMessage(conversationId, text, token);
      setMessages((prev) => [...prev, mapMessage(sent)]);
      setInput('');
    } catch (_) {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
      <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMe]}>{item.text}</Text>
      <Text style={[styles.bubbleTime, item.fromMe && styles.bubbleTimeMe]}>{item.time}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendBtnText}>{sending ? '…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { ...typography.body, color: colors.text },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.8)' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { ...typography.label, color: '#fff' },
});
