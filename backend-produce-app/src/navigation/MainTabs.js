import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import FeedScreen from '../screens/FeedScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Feed: '🥬',
    Messages: '💬',
    Profile: '👤',
  };
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Text style={styles.icon}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#5B8C5A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#5B8C5A',
        tabBarInactiveTintColor: '#8A9A8C',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={({ navigation }) => ({
          title: 'Nearby Produce',
          headerRight: () => (
            <Text
              onPress={() => navigation.navigate('CreateListing')}
              style={styles.headerButton}
            >
              List produce
            </Text>
          ),
        })}
      />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#E2E9E3',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  iconWrap: {
    padding: 4,
    borderRadius: 8,
  },
  iconWrapFocused: {
    backgroundColor: 'rgba(91, 140, 90, 0.15)',
  },
  icon: {
    fontSize: 22,
  },
  headerButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
  },
});
