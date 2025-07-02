import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getCacheInfo, clearCache } from '../services/stockService';

interface CacheStatusProps {
  onCacheCleared?: () => void;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ onCacheCleared }) => {
  const [cacheInfo, setCacheInfo] = React.useState<{
    cacheSize: number;
    rateLimitInfo: {
      requestsMade: number;
      lastResetDate: string;
    };
  } | null>(null);

  React.useEffect(() => {
    updateCacheInfo();
  }, []);

  const updateCacheInfo = () => {
    const info = getCacheInfo();
    setCacheInfo(info);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the cache? This will force fresh API requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              updateCacheInfo();
              onCacheCleared?.();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  if (!cacheInfo) return null;

  const { cacheSize, rateLimitInfo } = cacheInfo;
  const requestsRemaining = 25 - rateLimitInfo.requestsMade;
  const isRateLimitWarning = requestsRemaining <= 5;

  return (
    <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-blue-800 dark:text-blue-200">
          API Status
        </Text>
        <TouchableOpacity
          onPress={handleClearCache}
          className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded"
        >
          <Text className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            Clear Cache
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="space-y-1">
        <View className="flex-row justify-between">
          <Text className="text-xs text-blue-600 dark:text-blue-300">
            Cache Entries:
          </Text>
          <Text className="text-xs font-medium text-blue-800 dark:text-blue-200">
            {cacheSize}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-xs text-blue-600 dark:text-blue-300">
            Requests Today:
          </Text>
          <Text className={`text-xs font-medium ${
            isRateLimitWarning 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {rateLimitInfo.requestsMade}/25
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-xs text-blue-600 dark:text-blue-300">
            Remaining:
          </Text>
          <Text className={`text-xs font-medium ${
            isRateLimitWarning 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {requestsRemaining}
          </Text>
        </View>
        
        {isRateLimitWarning && (
          <Text className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
            ⚠️ Rate limit warning
          </Text>
        )}
      </View>
    </View>
  );
}; 