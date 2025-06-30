import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import "./global.css"
import { ExploreScreen } from './src/screens/ExploreScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { ProductScreen } from "./src/screens/ProductScreen"
import { ViewAllScreen } from './src/screens/ViewAllScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ExploreMain" 
        component={ExploreScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Product" 
        component={ProductScreen}
        options={{
          title: 'Stock Details',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen 
        name="ViewAll" 
        component={ViewAllScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function WatchlistStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WatchlistMain" 
        component={WatchlistScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Product" 
        component={ProductScreen}
        options={{
          title: 'Stock Details',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen 
        name="ViewAll" 
        component={ViewAllScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#E5E7EB',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Explore" 
          component={ExploreStack}
          options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>📊</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Watchlist" 
          component={WatchlistStack}
          options={{
            tabBarLabel: 'Watchlist',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>⭐</Text>
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
