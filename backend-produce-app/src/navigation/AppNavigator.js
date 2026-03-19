import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import ChatScreen from '../screens/ChatScreen';
import SchedulePickupScreen from '../screens/SchedulePickupScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import ScheduledPickupsScreen from '../screens/ScheduledPickupsScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#5B8C5A' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="ListingDetail"
              component={ListingDetailScreen}
              options={{ title: 'Listing' }}
            />
            <Stack.Screen
              name="CreateListing"
              component={CreateListingScreen}
              options={{ title: 'List Your Produce' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Message' }}
            />
            <Stack.Screen
              name="SchedulePickup"
              component={SchedulePickupScreen}
              options={{ title: 'Schedule Pickup' }}
            />
            <Stack.Screen
              name="Reviews"
              component={ReviewsScreen}
              options={{ title: 'Reviews' }}
            />
            <Stack.Screen
              name="MyListings"
              component={MyListingsScreen}
              options={{ title: 'My Listings' }}
            />
            <Stack.Screen
              name="ScheduledPickups"
              component={ScheduledPickupsScreen}
              options={{ title: 'Scheduled Pickups' }}
            />
            <Stack.Screen
              name="MyReviews"
              component={MyReviewsScreen}
              options={{ title: 'My Reviews' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
