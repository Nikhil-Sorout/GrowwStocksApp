import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '@groww_theme_preference';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderSecondary: string;

  // Interactive colors
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;

  // Status colors
  success: string;
  successText: string;
  error: string;
  errorText: string;
  warning: string;
  warningText: string;

  // Chart colors
  chartBackground: string;
  chartGrid: string;

  // Tab bar colors
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

const lightTheme: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  border: '#E5E7EB',
  borderSecondary: '#F3F4F6',

  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  secondary: '#6B7280',
  secondaryText: '#FFFFFF',

  success: '#10B981',
  successText: '#FFFFFF',
  error: '#EF4444',
  errorText: '#FFFFFF',
  warning: '#F59E0B',
  warningText: '#FFFFFF',

  chartBackground: '#FFFFFF',
  chartGrid: '#F3F4F6',

  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#6B7280',
};

const darkTheme: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  border: '#374151',
  borderSecondary: '#4B5563',

  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  secondary: '#6B7280',
  secondaryText: '#FFFFFF',

  success: '#10B981',
  successText: '#FFFFFF',
  error: '#EF4444',
  errorText: '#FFFFFF',
  warning: '#F59E0B',
  warningText: '#FFFFFF',

  chartBackground: '#1F2937',
  chartGrid: '#374151',

  tabBarBackground: '#1F2937',
  tabBarBorder: '#374151',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#6B7280',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: Theme) => Promise<void>;
  systemColorScheme: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [theme, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const updateTheme = () => {
    let shouldBeDark = false;

    switch (theme) {
      case 'light':
        shouldBeDark = false;
        break;
      case 'dark':
        shouldBeDark = true;
        break;
      case 'system':
        shouldBeDark = systemColorScheme === 'dark';
        break;
    }

    setIsDark(shouldBeDark);
    setColors(shouldBeDark ? darkTheme : lightTheme);
  };

  const setThemePreference = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        setTheme: setThemePreference,
        systemColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
