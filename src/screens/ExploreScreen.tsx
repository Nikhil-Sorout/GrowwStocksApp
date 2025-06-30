import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StockCard } from '../components/StockCard';
import { SectionHeader } from '../components/SectionHeader';
import { getTopGainers, getTopLosers } from '../services/stockService';
import { Stock } from '../types';

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setTopGainers(getTopGainers());
      setTopLosers(getTopLosers());
      setLoading(false);
    }, 1000);
  };

  const handleStockPress = (stock: Stock) => {
    // Navigate to Product screen
    navigation.navigate('Product' as never, { stock } as never);
  };

  const handleViewAllGainers = () => {
    navigation.navigate('ViewAll' as never, { type: 'gainers' } as never);
  };

  const handleViewAllLosers = () => {
    navigation.navigate('ViewAll' as never, { type: 'losers' } as never);
  };

  const renderStockCard = ({ item }: { item: Stock }) => (
    <StockCard stock={item} onPress={handleStockPress} />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading stocks...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="pt-4">
        {/* Top Gainers Section */}
        <SectionHeader title="Top Gainers" onViewAll={handleViewAllGainers} />
        <FlatList
          data={topGainers}
          renderItem={renderStockCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-6"
        />

        {/* Top Losers Section */}
        <SectionHeader title="Top Losers" onViewAll={handleViewAllLosers} />
        <FlatList
          data={topLosers}
          renderItem={renderStockCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-6"
        />
      </View>
    </ScrollView>
  );
}; 