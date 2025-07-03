import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StockCard } from '../components/StockCard';
import {
  getWatchlists,
  createWatchlist,
  deleteWatchlist,
} from '../services/watchlistService';
import { Watchlist, Stock } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';

export const WatchlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { showErrorAlert, showSuccessAlert, showConfirmAlert, AlertComponent } =
    useCustomAlert();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [expandedWatchlist, setExpandedWatchlist] = useState<string | null>(
    null
  );
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
      showErrorAlert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      await createWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowCreateModal(false);
      loadWatchlists();
      showSuccessAlert('Success', 'Watchlist created successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to create watchlist');
    }
  };

  const handleDeleteWatchlist = async (
    watchlistId: string,
    watchlistName: string
  ) => {
    showConfirmAlert(
      'Delete Watchlist',
      `Are you sure you want to delete "${watchlistName}"?`,
      async () => {
        try {
          await deleteWatchlist(watchlistId);
          loadWatchlists();
          showSuccessAlert('Success', 'Watchlist deleted successfully');
        } catch (error) {
          showErrorAlert('Error', 'Failed to delete watchlist');
        }
      },
      undefined,
      'Delete',
      'Cancel'
    );
  };

  const handleStockPress = (stock: Stock) => {
    (navigation as any).navigate('Product', { stock });
  };

  const toggleWatchlistExpansion = (watchlistId: string) => {
    setExpandedWatchlist(
      expandedWatchlist === watchlistId ? null : watchlistId
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <AlertComponent />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.textSecondary }}>
            Loading watchlists...
          </Text>
        </View>
      ) : watchlists.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <View className="items-center">
            <Ionicons
              name="trending-up"
              size={64}
              color={colors.textSecondary}
              style={{ marginBottom: 16 }}
            />
            <Text
              className="text-xl font-semibold text-center mb-2"
              style={{ color: colors.text }}
            >
              No watchlists yet
            </Text>
            <Text
              className="text-center mb-6"
              style={{ color: colors.textSecondary }}
            >
              Start by creating a watchlist and adding stocks to track
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-full border"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-medium"
                style={{ color: colors.primaryText }}
              >
                Create Watchlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Header */}
          <View
            className="flex-row justify-between items-center p-4 border-b"
            style={{
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            }}
          >
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              My Watchlists
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-full border"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-medium"
                style={{ color: colors.primaryText }}
              >
                + New
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {watchlists.map(watchlist => (
              <View
                key={watchlist.id}
                className="rounded-lg mb-4 border shadow-sm"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: colors.text,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  borderColor: colors.border,
                }}
              >
                {/* Watchlist Header */}
                <View className="p-4 flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => toggleWatchlistExpansion(watchlist.id)}
                    className="flex-1 flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: colors.text }}
                      >
                        {watchlist.name}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {watchlist.stocks.length} stocks
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        expandedWatchlist === watchlist.id
                          ? 'chevron-down'
                          : 'chevron-forward'
                      }
                      size={16}
                      color={colors.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteWatchlist(watchlist.id, watchlist.name)
                    }
                    className="px-2 py-1 rounded-full ml-2"
                    style={{
                      backgroundColor: colors.error + '20',
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Watchlist Stocks */}
                {expandedWatchlist === watchlist.id && (
                  <View
                    className="border-t"
                    style={{ borderTopColor: colors.borderSecondary }}
                  >
                    {watchlist.stocks.length === 0 ? (
                      <View className="p-4 items-center">
                        <Text
                          className="text-center"
                          style={{ color: colors.textSecondary }}
                        >
                          No stocks in this watchlist yet
                        </Text>
                        <Text
                          className="text-xs text-center mt-1"
                          style={{ color: colors.textTertiary }}
                        >
                          Add stocks from the Explore screen
                        </Text>
                      </View>
                    ) : (
                      <View className="p-4">
                        {watchlist.stocks.map(stock => (
                          <View key={stock.id} className="mb-3">
                            <StockCard
                              stock={stock}
                              onPress={handleStockPress}
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Create Watchlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="rounded-lg p-6 mx-4 w-80"
            style={{
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Create New Watchlist
            </Text>
            <TextInput
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              placeholder="Enter watchlist name"
              placeholderTextColor={colors.textTertiary}
              className="border rounded-lg p-3 mb-4"
              style={{
                borderColor: colors.border,
                color: colors.text,
              }}
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
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateWatchlist}
                className="px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-medium"
                  style={{ color: colors.primaryText }}
                >
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
