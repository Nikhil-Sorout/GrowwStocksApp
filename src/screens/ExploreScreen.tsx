import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StockCard } from '../components/StockCard';
import { SectionHeader } from '../components/SectionHeader';
import { HorizontalStockList } from '../components/HorizontalStockList';

import {
  getTopGainers,
  getTopLosers,
  getMostActivelyTraded,
  debouncedSearchStocks,
  getStockBySymbol,
} from '../services/stockService';
import { Stock, SearchResult } from '../types';
import { formatPriceWithCurrency } from '../utils/timezoneUtils';
import { useTheme } from '../hooks/useTheme';

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [mostActivelyTraded, setMostActivelyTraded] = useState<Stock[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debouncedSearchStocks(searchQuery, results => {
      setSearchResults(results);
      setIsSearching(false);
    });
  }, [searchQuery]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [mostActive, gainers, losers] = await Promise.all([
        getMostActivelyTraded(),
        getTopGainers(),
        getTopLosers(),
      ]);

      setMostActivelyTraded(mostActive.slice(0, 20));
      setTopGainers(gainers.slice(0, 20));
      setTopLosers(losers.slice(0, 20));
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (stock: Stock) => {
    (navigation as any).navigate('Product', { stock });
  };

  const handleSearchResultPress = async (searchResult: SearchResult) => {
    // First check if stock exists in cached data
    const cachedStock = await getStockBySymbol(searchResult.symbol);

    if (cachedStock) {
      // Use cached stock (USD, US timezone)
      (navigation as any).navigate('Product', { stock: cachedStock });
    } else {
      // Create new stock with search result's actual data (no hardcoded overrides)
      const newStock: Stock = {
        id: searchResult.symbol,
        symbol: searchResult.symbol,
        name: searchResult.name,
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        marketCap: 0,
        peRatio: 0,
        volume: 0,
        high: 0,
        low: 0,
        open: 0,
        previousClose: 0,
        currency: searchResult.currency,
        timezone: searchResult.timezone,
        region: searchResult.region,
        marketOpen: searchResult.marketOpen,
        marketClose: searchResult.marketClose,
        marketTimezone: searchResult.timezone, // Use actual timezone from API
        exchange: undefined, // Will be populated from company info if available
        country: searchResult.region,
      };
      (navigation as any).navigate('Product', { stock: newStock });
    }
  };

  const handleViewAll = (type: string) => {
    (navigation as any).navigate('ViewAll', { type });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View className="w-full px-4 mb-2">
      <TouchableOpacity
        onPress={() => handleSearchResultPress(item)}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              {item.symbol}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {item.name}
            </Text>
            <Text className="text-xs" style={{ color: colors.textTertiary }}>
              {item.region} • {item.currency}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs" style={{ color: colors.textTertiary }}>
              Match: {(parseFloat(item.matchScore) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.textSecondary} />
          <Text className="mt-4" style={{ color: colors.textSecondary }}>
            Loading stocks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            GrowwStocks
          </Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Settings')}
            className="p-2"
          >
            <Ionicons name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <TextInput
              placeholder="Search stocks..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="px-4 py-3 rounded-lg border text-base"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <Text
                className="font-medium"
                style={{ color: colors.textSecondary }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-2 px-1">
          {/* Search Results */}
          {isSearching && (
            <View className="mb-4">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Searching...
              </Text>
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text className="mt-2" style={{ color: colors.textSecondary }}>
                  Searching for "{searchQuery}"...
                </Text>
              </View>
            </View>
          )}

          {!isSearching && searchResults.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-lg font-semibold px-4 mb-3"
                style={{ color: colors.text }}
              >
                Search Results ({searchResults.length})
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={item => item.symbol}
                scrollEnabled={false}
                className="mb-4"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {!isSearching &&
            searchQuery.length > 0 &&
            searchResults.length === 0 && (
              <View className="mb-4">
                <View className="px-4 py-8 items-center">
                  <Text
                    className="text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    No stocks found matching "{searchQuery}"
                  </Text>
                </View>
              </View>
            )}

          {/* Stock Lists */}
          {!isSearching && searchQuery.length === 0 && (
            <>
              <SectionHeader
                title="Most Actively Traded"
                onViewAll={() => handleViewAll('most_actively_traded')}
              />
              <HorizontalStockList
                data={mostActivelyTraded}
                onStockPress={handleStockPress}
                itemWidth={160}
                spacing={12}
              />
              <View className="mb-6" />

              <SectionHeader
                title="Top Gainers"
                onViewAll={() => handleViewAll('gainers')}
              />
              <HorizontalStockList
                data={topGainers}
                onStockPress={handleStockPress}
                itemWidth={160}
                spacing={12}
              />
              <View className="mb-6" />

              <SectionHeader
                title="Top Losers"
                onViewAll={() => handleViewAll('losers')}
              />
              <HorizontalStockList
                data={topLosers}
                onStockPress={handleStockPress}
                itemWidth={160}
                spacing={12}
              />
              <View className="mb-6" />
            </>
          )}

          {/* Demo Section
          <View className="p-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Demo
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('DemoProduct' as never)}
              className="bg-blue-500 p-4 rounded-lg"
            >
              <Text className="text-white text-center font-medium">
                View IBM Demo Product Screen
              </Text>
              <Text className="text-blue-100 text-center text-sm mt-1">
                Real Alpha Vantage API data with loading states
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
