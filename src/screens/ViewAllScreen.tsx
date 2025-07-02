import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StockCard } from '../components/StockCard';
import { getTopGainers, getTopLosers, getMostActivelyTraded, getAllStocks } from '../services/stockService';
import { Stock } from '../types';

interface ViewAllScreenRouteParams {
  type: 'gainers' | 'losers' | 'most_actively_traded' | 'all';
}

const ITEMS_PER_PAGE = 10;

export const ViewAllScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params as ViewAllScreenRouteParams;
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    loadStocks();
  }, [type]);

  const loadStocks = async () => {
    setLoading(true);
    setCurrentPage(1);
    setHasMoreData(true);
    
    try {
      let stockData: Stock[] = [];
      
      switch (type) {
        case 'gainers':
          stockData = await getTopGainers();
          break;
        case 'losers':
          stockData = await getTopLosers();
          break;
        case 'most_actively_traded':
          stockData = await getMostActivelyTraded();
          break;
        case 'all':
          stockData = await getAllStocks();
          break;
        default:
          stockData = await getAllStocks();
      }
      
      setStocks(stockData);
      setHasMoreData(stockData.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (stock: Stock) => {
    (navigation as any).navigate('Product', { stock });
  };

  const renderStockCard = ({ item }: { item: Stock }) => (
    <View className="w-1/2 px-2 mb-4">
      <StockCard stock={item} onPress={handleStockPress} />
    </View>
  );

  const loadMoreData = () => {
    if (hasMoreData && !loading) {
      setCurrentPage(prev => {
        const newPage = prev + 1;
        const endIndex = newPage * ITEMS_PER_PAGE;
        if (endIndex >= stocks.length) {
          setHasMoreData(false);
        }
        return newPage;
      });
    }
  };

  // Use useMemo to prevent unnecessary recalculations
  const displayedStocks = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return stocks.slice(0, endIndex);
  }, [stocks, currentPage]);

  const renderFooter = () => {
    if (!hasMoreData) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-500 dark:text-gray-400">No more stocks to load</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading more...</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={loadMoreData}
        className="py-4 items-center"
        activeOpacity={0.7}
      >
        <Text className="text-blue-500 font-medium">Load More</Text>
      </TouchableOpacity>
    );
  };

  const getScreenTitle = () => {
    switch (type) {
      case 'gainers':
        return 'Top Gainers';
      case 'losers':
        return 'Top Losers';
      case 'most_actively_traded':
        return 'Most Actively Traded';
      case 'all':
        return 'All Stocks';
      default:
        return 'Stocks';
    }
  };

  if (loading && stocks.length === 0) {
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
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3"
        >
          <Text className="text-blue-500 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {getScreenTitle()}
        </Text>
        <Text className="ml-2 text-gray-500 dark:text-gray-400">
          ({stocks.length} stocks)
        </Text>
      </View>

      <FlatList
        data={displayedStocks}
        renderItem={renderStockCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 dark:text-gray-400">No stocks found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}; 