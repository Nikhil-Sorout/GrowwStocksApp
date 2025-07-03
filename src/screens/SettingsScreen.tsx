import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { clearCache, getCacheInfo } from '../services/stockService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@groww_api_key';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const { showErrorAlert, showSuccessAlert, showConfirmAlert, AlertComponent } =
    useCustomAlert();
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  React.useEffect(() => {
    loadApiKey();
    loadCacheInfo();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadCacheInfo = () => {
    const info = getCacheInfo();
    setCacheInfo(info);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      showErrorAlert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setShowApiKeyModal(false);
      showSuccessAlert('Success', 'API key saved successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to save API key');
    }
  };

  const handleClearCache = async () => {
    showConfirmAlert(
      'Clear Cache',
      "This will clear all cached data. You'll need to reload data from the API. Continue?",
      async () => {
        try {
          await clearCache();
          loadCacheInfo();
          showSuccessAlert('Success', 'Cache cleared successfully');
        } catch (error) {
          showErrorAlert('Error', 'Failed to clear cache');
        }
      },
      undefined,
      'Clear',
      'Cancel'
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'settings';
      default:
        return 'settings';
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Theme',
          subtitle: getThemeLabel(),
          icon: getThemeIcon(),
          onPress: () => setShowThemeToggle(true),
        },
      ],
    },
    {
      title: 'API Configuration',
      items: [
        {
          title: 'Alpha Vantage API Key',
          subtitle: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set',
          icon: 'key',
          onPress: () => setShowApiKeyModal(true),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          title: 'Cache Information',
          subtitle: cacheInfo ? `${cacheInfo.cacheSize} entries` : 'Loading...',
          icon: 'save',
          onPress: () => {
            if (cacheInfo) {
              showConfirmAlert(
                'Cache Information',
                `Cache Size: ${cacheInfo.cacheSize} entries\nRequests Today: ${cacheInfo.rateLimitInfo.requestsMade}/25\nLast Reset: ${cacheInfo.rateLimitInfo.lastResetDate}`,
                undefined,
                undefined,
                'OK'
              );
            }
          },
        },
        {
          title: 'Clear Cache',
          subtitle: 'Remove all cached data',
          icon: 'trash',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          subtitle: '1.0.0',
          icon: 'phone-portrait',
          onPress: () => {},
        },
        {
          title: 'Data Source',
          subtitle: 'Alpha Vantage API',
          icon: 'trending-up',
          onPress: () => {
            showConfirmAlert(
              'Data Source',
              'This app uses Alpha Vantage API for real-time stock market data.\n\nFree tier limits:\n• 25 requests per day\n• 5 requests per minute\n\nUpgrade to premium for higher limits.',
              undefined,
              undefined,
              'OK'
            );
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <AlertComponent />
      <ScrollView className="flex-1 p-4">
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text
              className="text-sm font-semibold mb-3 uppercase tracking-wide"
              style={{
                color: colors.textSecondary,
              }}
            >
              {section.title}
            </Text>

            <View
              className="rounded-xl overflow-hidden border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  className="flex-row items-center p-4"
                  style={{
                    borderBottomWidth:
                      itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderSecondary,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <View className="flex-1">
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text
                    className="text-lg"
                    style={{ color: colors.textTertiary }}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Theme Toggle Modal */}
      <ThemeToggle
        visible={showThemeToggle}
        onClose={() => setShowThemeToggle(false)}
      />

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="rounded-2xl p-6 mx-4 w-80"
            style={{
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              API Key Configuration
            </Text>

            <Text
              className="mb-4 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Enter your Alpha Vantage API key for better rate limits. Get a
              free key at alphavantage.co. The app currently uses a demo key
              with limited requests (25/day).
            </Text>

            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API key"
              placeholderTextColor={colors.textTertiary}
              className="border rounded-lg p-3 mb-4"
              style={{
                borderColor: colors.border,
                color: colors.text,
              }}
              secureTextEntry
            />

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowApiKeyModal(false)}
                className="px-4 py-2"
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveApiKey}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  className="font-medium"
                  style={{ color: colors.primaryText }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
