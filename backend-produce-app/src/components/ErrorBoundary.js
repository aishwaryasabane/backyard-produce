import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{String(this.state.error.message)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAF5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3A2C',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#5C6B5E',
    textAlign: 'center',
  },
});
