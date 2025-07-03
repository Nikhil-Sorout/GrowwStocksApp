import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import './global.css';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { ProductScreen } from './src/screens/ProductScreen';
import { ViewAllScreen } from './src/screens/ViewAllScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ExploreStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
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
        }}
      />
      <Stack.Screen
        name="ViewAll"
        component={ViewAllScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}

function WatchlistStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
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
        }}
      />
      <Stack.Screen
        name="ViewAll"
        component={ViewAllScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.tabBarActive,
            tabBarInactiveTintColor: colors.tabBarInactive,
            tabBarStyle: {
              backgroundColor: colors.tabBarBackground,
              borderTopColor: colors.tabBarBorder,
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
                <Ionicons name="trending-up" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Watchlist"
            component={WatchlistStack}
            options={{
              tabBarLabel: 'Watchlist',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="star" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
        <StatusBar style={colors.background === '#111827' ? 'light' : 'dark'} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
