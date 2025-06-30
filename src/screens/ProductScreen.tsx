import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getStockChartData } from '../services/stockService';
import { getWatchlists, addStockToWatchlist, removeStockFromWatchlist } from '../services/watchlistService';
import { SimpleChart } from '../components/SimpleChart';
import { Stock, Watchlist } from '../types';

interface ProductScreenRouteParams {
  stock: Stock;
}

export const ProductScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { stock } = route.params as ProductScreenRouteParams;
  
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [stock.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load chart data
      const data = getStockChartData(stock.id);
      const formattedData = data.map((item, index) => ({
        x: index,
        y: item.price,
      }));
      setChartData(formattedData);

      // Load watchlists and check if stock is in any
      const userWatchlists = await getWatchlists();
      setWatchlists(userWatchlists);
      
      const inWatchlist = userWatchlists.some(wl => 
        wl.stocks.some(s => s.id === stock.id)
      );
      setIsInWatchlist(inWatchlist);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (watchlists.length === 0) {
      Alert.alert(
        'No Watchlists',
        'You need to create a watchlist first. Would you like to create one?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create', onPress: () => navigation.navigate('Watchlist' as never) },
        ]
      );
      return;
    }

    if (isInWatchlist) {
      // Remove from watchlist
      const watchlistWithStock = watchlists.find(wl => 
        wl.stocks.some(s => s.id === stock.id)
      );
      if (watchlistWithStock) {
        await removeStockFromWatchlist(watchlistWithStock.id, stock.id);
        setIsInWatchlist(false);
        Alert.alert('Success', 'Stock removed from watchlist');
      }
    } else {
      // Add to first watchlist (you could show a modal to choose which one)
      if (watchlists.length > 0) {
        await addStockToWatchlist(watchlists[0].id, stock);
        setIsInWatchlist(true);
        Alert.alert('Success', `Stock added to ${watchlists[0].name}`);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-600 dark:text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="p-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {stock.symbol}
          </Text>
          <TouchableOpacity
            onPress={handleWatchlistToggle}
            className={`p-2 rounded-full ${isInWatchlist ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            <Text className="text-white font-medium">
              {isInWatchlist ? 'Remove' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {stock.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mr-3">
            ₹{stock.currentPrice.toFixed(2)}
          </Text>
          <View className={`px-3 py-1 rounded-full ${stock.changePercent >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <Text className={`font-medium ${stock.changePercent >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Price Chart (30 Days)
        </Text>
        <View className="h-64">
          <SimpleChart
            data={chartData}
            width={350}
            height={250}
            color={stock.changePercent >= 0 ? '#10B981' : '#EF4444'}
          />
        </View>
      </View>

      {/* Stock Details */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stock Details
        </Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Market Cap</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              ₹{formatNumber(stock.marketCap)} Cr
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">P/E Ratio</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {stock.peRatio.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Volume</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {formatNumber(stock.volume)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">High</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              ₹{stock.high.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Low</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              ₹{stock.low.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Open</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              ₹{stock.open.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Previous Close</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              ₹{stock.previousClose.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};