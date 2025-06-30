import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StockCard } from '../components/StockCard';
import { getWatchlists, createWatchlist, deleteWatchlist } from '../services/watchlistService';
import { Watchlist, Stock } from '../types';

export const WatchlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [expandedWatchlist, setExpandedWatchlist] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlists();
    }, [])
  );

  const loadWatchlists = async () => {
    setLoading(true);
    try {
      const data = await getWatchlists();
      setWatchlists(data);
    } catch (error) {
      console.error('Error loading watchlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      await createWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowCreateModal(false);
      loadWatchlists();
      Alert.alert('Success', 'Watchlist created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create watchlist');
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string, watchlistName: string) => {
    Alert.alert(
      'Delete Watchlist',
      `Are you sure you want to delete "${watchlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWatchlist(watchlistId);
              loadWatchlists();
              Alert.alert('Success', 'Watchlist deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete watchlist');
            }
          },
        },
      ]
    );
  };

  const handleStockPress = (stock: Stock) => {
    navigation.navigate('Product' as never, { stock } as never);
  };

  const toggleWatchlistExpansion = (watchlistId: string) => {
    setExpandedWatchlist(expandedWatchlist === watchlistId ? null : watchlistId);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-600 dark:text-gray-400">Loading watchlists...</Text>
      </View>
    );
  }

  if (watchlists.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 px-4">
        <View className="items-center">
          <Text className="text-6xl mb-4">📊</Text>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            No watchlists yet
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Start by creating a watchlist and adding stocks to track
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium">Create Watchlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          My Watchlists
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="bg-blue-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {watchlists.map((watchlist) => (
          <View
            key={watchlist.id}
            className="bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {/* Watchlist Header */}
            <TouchableOpacity
              onPress={() => toggleWatchlistExpansion(watchlist.id)}
              className="p-4 flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {watchlist.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {watchlist.stocks.length} stocks
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 mr-2">
                  {expandedWatchlist === watchlist.id ? '▼' : '▶'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteWatchlist(watchlist.id, watchlist.name)}
                  className="ml-2"
                >
                  <Text className="text-red-500 text-lg">×</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Watchlist Stocks */}
            {expandedWatchlist === watchlist.id && (
              <View className="border-t border-gray-100 dark:border-gray-700">
                {watchlist.stocks.length === 0 ? (
                  <View className="p-4 items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                      No stocks in this watchlist yet
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1">
                      Add stocks from the Explore screen
                    </Text>
                  </View>
                ) : (
                  <View className="p-4">
                    {watchlist.stocks.map((stock) => (
                      <View key={stock.id} className="mb-3">
                        <StockCard stock={stock} onPress={handleStockPress} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Create Watchlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Watchlist
            </Text>
            <TextInput
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              placeholder="Enter watchlist name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-gray-900 dark:text-white"
              autoFocus
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setNewWatchlistName('');
                }}
                className="px-4 py-2"
              >
                <Text className="text-gray-600 dark:text-gray-400">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateWatchlist}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 