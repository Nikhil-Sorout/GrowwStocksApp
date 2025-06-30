import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StockCard } from '../components/StockCard';
import { SectionHeader } from '../components/SectionHeader';
import { getTopGainers, getTopLosers, getAllStocks } from '../services/stockService';
import { Stock } from '../types';

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const filtered = allStocks.filter(stock =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, allStocks]);

  const loadStockData = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Get only first 4 stocks for each section
      const allGainers = getTopGainers();
      const allLosers = getTopLosers();
      const allStocksData = getAllStocks();
      
      setTopGainers(allGainers.slice(0, 4));
      setTopLosers(allLosers.slice(0, 4));
      setAllStocks(allStocksData);
      setLoading(false);
    }, 1000);
  };

  const handleStockPress = (stock: Stock) => {
    // Navigate to Product screen
    (navigation as any).navigate('Product', { stock });
  };

  const handleViewAllGainers = () => {
    (navigation as any).navigate('ViewAll', { type: 'gainers' });
  };

  const handleViewAllLosers = () => {
    (navigation as any).navigate('ViewAll', { type: 'losers' });
  };

  const renderStockCard = ({ item }: { item: Stock }) => (
    <View className="w-1/2 px-2 mb-4">
      <StockCard stock={item} onPress={handleStockPress} />
    </View>
  );

  const renderSearchResult = ({ item }: { item: Stock }) => (
    <View className="w-full px-4 mb-2">
      <TouchableOpacity
        onPress={() => handleStockPress(item)}
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
          </View>
          <View className="items-end">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              ₹{item.currentPrice.toFixed(2)}
            </Text>
            <Text className={`text-sm font-medium ${item.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
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
        <View className="pt-2">
          {/* Search Results */}
          {isSearching && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white px-4 mb-3">
                Search Results ({searchResults.length})
              </Text>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  className="mb-4"
                />
              ) : (
                <View className="px-4 py-8 items-center">
                  <Text className="text-gray-600 dark:text-gray-400 text-center">
                    No stocks found matching "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Top Gainers Section */}
          {!isSearching && (
            <>
              <SectionHeader title="Top Gainers" onViewAll={handleViewAllGainers} />
              <FlatList
                data={topGainers}
                renderItem={renderStockCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                className="mb-6"
              />

              {/* Top Losers Section */}
              <SectionHeader title="Top Losers" onViewAll={handleViewAllLosers} />
              <FlatList
                data={topLosers}
                renderItem={renderStockCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                className="mb-6"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 