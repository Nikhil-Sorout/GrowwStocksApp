import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stock } from '../types';

interface StockCardProps {
  stock: Stock;
  onPress: (stock: Stock) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onPress }) => {
  const isPositive = stock.changePercent >= 0;
  
  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0.00';
    return `$${price.toFixed(2)}`;
  };
  
  const formatVolume = (vol: number) => {
    if (!vol || isNaN(vol)) return '0K';
    return `${(vol / 1000).toFixed(0)}K`;
  };
  
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 w-full"
      onPress={() => onPress(stock)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {stock.symbol}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400" numberOfLines={2}>
            {stock.name}
          </Text>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {formatPrice(stock.currentPrice)}
        </Text>
        <View className={`px-2 py-1 rounded-md ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <Text className={`text-xs font-medium ${isPositive ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Vol: {formatVolume(stock.volume)}
        </Text>
        <Text className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{formatPrice(stock.change)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}; 