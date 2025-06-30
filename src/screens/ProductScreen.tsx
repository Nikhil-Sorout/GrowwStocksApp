import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getStockChartData } from '../services/stockService';
import { getWatchlists, addStockToWatchlist, removeStockFromWatchlist } from '../services/watchlistService';
import { SimpleChart } from '../components/SimpleChart';
import { Stock, Watchlist } from '../types';
import { CartesianChart, Line } from "victory-native";

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
    const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false);

    // const DATA = Array.from({ length: 31 }, (_, i) => ({
    //     day: i,
    //     highTmp: 40 + 30 * Math.random(),
    // }));

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
        const userWatchlists = await getWatchlists();
        if (userWatchlists.length === 0) {
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

        const inWatchlist = userWatchlists.some(wl =>
            wl.stocks.some(s => s.id === stock.id)
        );

        if (inWatchlist) {
            // Remove from watchlist
            const watchlistWithStock = userWatchlists.find(wl =>
                wl.stocks.some(s => s.id === stock.id)
            );
            if (watchlistWithStock) {
                await removeStockFromWatchlist(watchlistWithStock.id, stock.id);
                setIsInWatchlist(false);
                Alert.alert('Success', 'Stock removed from watchlist');
            }
        } else {
            // Show dropdown to select watchlist
            setWatchlists(userWatchlists);
            setShowWatchlistDropdown(!showWatchlistDropdown);
        }
    };

    const handleAddToWatchlist = async (watchlist: Watchlist) => {
        try {
            await addStockToWatchlist(watchlist.id, stock);
            setIsInWatchlist(true);
            Alert.alert('Success', `Stock added to ${watchlist.name}`);
            setShowWatchlistDropdown(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add stock to watchlist');
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
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1">
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
                {chartData.length > 0 && (
                    <View className="p-4">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Price Chart (30 Days)
                        </Text>
                        <View className="h-64">
                            {/* <SimpleChart
                data={chartData}
                width={350}
                height={250}
                color={stock.changePercent >= 0 ? '#10B981' : '#EF4444'}
              /> */}
                            <CartesianChart data={chartData} xKey="x" yKeys={["y"]}>
                                {/* 👇 render function exposes various data, such as points. */}
                                {({ points }) => (
                                    // 👇 and we'll use the Line component to render a line path.
                                    <Line points={points.y} color={stock.changePercent >= 0 ? '#10B981' : '#EF4444'} strokeWidth={3} />
                                )}
                            </CartesianChart>
                        </View>
                    </View>
                )}

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
            
            {/* Watchlist Selection Dropdown */}
            {showWatchlistDropdown && (
                <View style={{
                    position: 'absolute',
                    top: 80,
                    right: 16,
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 250,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    zIndex: 1000,
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: 8,
                        textAlign: 'center'
                    }}>
                        Select Watchlist
                    </Text>
                    
                    <ScrollView style={{ maxHeight: 200 }}>
                        {watchlists.map((watchlist) => (
                            <TouchableOpacity
                                key={watchlist.id}
                                onPress={() => handleAddToWatchlist(watchlist)}
                                style={{
                                    padding: 12,
                                    borderRadius: 6,
                                    marginBottom: 6,
                                    borderWidth: 1,
                                    borderColor: '#BFDBFE',
                                    backgroundColor: '#EFF6FF'
                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#111827'
                                        }}>
                                            {watchlist.name}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            color: '#6B7280'
                                        }}>
                                            {watchlist.stocks.length} stocks
                                        </Text>
                                    </View>
                                    <View style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 12,
                                        backgroundColor: '#3B82F6'
                                    }}>
                                        <Text style={{
                                            color: '#FFFFFF',
                                            fontWeight: '500',
                                            fontSize: 10
                                        }}>
                                            Add
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    <TouchableOpacity
                        onPress={() => setShowWatchlistDropdown(false)}
                        style={{
                            marginTop: 8,
                            padding: 8,
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            borderRadius: 6,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: '#6B7280',
                            fontWeight: '500',
                            fontSize: 12
                        }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};