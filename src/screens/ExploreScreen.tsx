import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StockCard } from '../components/StockCard';
import { SectionHeader } from '../components/SectionHeader';
import { HorizontalStockList } from '../components/HorizontalStockList';
import { CacheStatus } from '../components/CacheStatus';
import { getTopGainers, getTopLosers, getMostActivelyTraded, debouncedSearchStocks } from '../services/stockService';
import { Stock, SearchResult } from '../types';


export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
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
    debouncedSearchStocks(searchQuery, (results) => {
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
        getTopLosers()
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

  const handleSearchResultPress = (searchResult: SearchResult) => {
    const stock: Stock = {
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
    };
    
    (navigation as any).navigate('Product', { stock });
  };

  const handleViewAll = (type: string) => {
    (navigation as any).navigate('ViewAll', { type });
  };

  const handleCacheCleared = () => {
    loadStockData();
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View className="w-full px-4 mb-2">
      <TouchableOpacity
        onPress={() => handleSearchResultPress(item)}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.symbol}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              {item.region} • {item.currency}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              Match: {(parseFloat(item.matchScore) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading stocks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            GrowwStocks
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <TextInput
              placeholder="Search stocks..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              style={{ fontSize: 16 }}
            />
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg"
            >
              <Text className="text-gray-600 dark:text-gray-400 font-medium">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="pt-2 px-1">
          <CacheStatus onCacheCleared={handleCacheCleared} />
          
          {/* Search Results */}
          {isSearching && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Searching...
              </Text>
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                  Searching for "{searchQuery}"...
                </Text>
              </View>
            </View>
          )}

          {!isSearching && searchResults.length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white px-4 mb-3">
                Search Results ({searchResults.length})
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.symbol}
                scrollEnabled={false}
                className="mb-4"
              />
            </View>
          )}

          {!isSearching && searchQuery.length > 0 && searchResults.length === 0 && (
            <View className="mb-4">
              <View className="px-4 py-8 items-center">
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  No stocks found matching "{searchQuery}"
                </Text>
              </View>
            </View>
          )}

          {/* Stock Lists */}
          {!isSearching && searchQuery.length === 0 && (
            <>
              <SectionHeader title="Most Actively Traded" onViewAll={() => handleViewAll('most_actively_traded')} />
              <HorizontalStockList
                data={mostActivelyTraded}
                onStockPress={handleStockPress}
                itemWidth={160}
                spacing={12}
              />
              <View className="mb-6" />

              <SectionHeader title="Top Gainers" onViewAll={() => handleViewAll('gainers')} />
              <HorizontalStockList
                data={topGainers}
                onStockPress={handleStockPress}
                itemWidth={160}
                spacing={12}
              />
              <View className="mb-6" />

              <SectionHeader title="Top Losers" onViewAll={() => handleViewAll('losers')} />
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