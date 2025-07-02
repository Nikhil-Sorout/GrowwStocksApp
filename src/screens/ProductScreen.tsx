import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Linking, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getStockChartData, fetchCompanyInfo } from '../services/stockService';
import { Stock, Watchlist, StockInfo, StockChartData } from '../types';
import { getWatchlists, addStockToWatchlist, removeStockFromWatchlist } from '../services/watchlistService';
import { SimpleChart } from '../components/SimpleChart';
// import { CartesianChart, Line } from "victory-native";

interface ProductScreenRouteParams {
    stock: Stock;
}

export const ProductScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { stock } = route.params as ProductScreenRouteParams;

    const [chartData, setChartData] = useState<{ x: number; y: number; date: string }[]>([]);
    const [companyInfo, setCompanyInfo] = useState<StockInfo | null>(null);
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllFinancialMetrics, setShowAllFinancialMetrics] = useState(false);
    const [showAllAnalystRatings, setShowAllAnalystRatings] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    // const DATA = Array.from({ length: 31 }, (_, i) => ({
    //     day: i,
    //     highTmp: 40 + 30 * Math.random(),
    // }));

    useEffect(() => {
        loadData();
    }, [stock.id]);

    const loadData = async () => {
        setLoading(true);
        setChartLoading(true);
        setError(null);

        try {
            // Load chart data and stock info in parallel
            const [chartDataResult, companyInfoResult] = await Promise.all([
                getStockChartData(stock.symbol),
                fetchCompanyInfo(stock.symbol)
            ]);

            // Format chart data with dates - ensure we have the most recent 30 data points
            const formattedData = chartDataResult.slice(-30).map((item, index) => ({
                x: index,
                y: item.price,
                date: new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            }));
            setChartData(formattedData);
            setCompanyInfo(companyInfoResult);

            // Load watchlists and check if stock is in any
            const userWatchlists = await getWatchlists();
            setWatchlists(userWatchlists);

            const inWatchlist = userWatchlists.some(wl =>
                wl.stocks.some(s => s.id === stock.id)
            );
            setIsInWatchlist(inWatchlist);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load stock data. Please try again.');
        } finally {
            setLoading(false);
            setChartLoading(false);
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

    const formatCurrency = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(2)}B`;
        } else if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        }
        return `$${num.toFixed(2)}`;
    };

    const formatPercentage = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return `${(num * 100).toFixed(2)}%`;
    };

    const handleOpenWebsite = () => {
        if (companyInfo?.OfficialSite) {
            Linking.openURL(companyInfo.OfficialSite);
        }
    };

    const handleRetry = () => {
        loadData();
    };

    // X-Axis: Show only a few date labels (start, 2 in the middle, end)
    const labelCount = 4;
    const labelIndexes = [
        0,
        Math.floor(chartData.length / 3),
        Math.floor((2 * chartData.length) / 3),
        chartData.length - 1
    ];
    const xLabels = chartData.map((item, index) =>
        labelIndexes.includes(index) ? item.date : ''
    );

    // Y-Axis: Show only a few price labels (min, max, median, or 3 spaced decimals if range is slight)
    const prices = chartData.map(item => item.y);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const medianPrice = prices.slice().sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const priceRange = maxPrice - minPrice;

    let yTicks;
    if (priceRange < 0.05) {
        // If range is very slight, show 3 evenly spaced decimal values
        yTicks = [
            minPrice,
            minPrice + priceRange / 2,
            maxPrice
        ];
    } else {
        yTicks = [minPrice, medianPrice, maxPrice];
    }

    const formatYLabel = (value: string | number) => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        // Use a small epsilon for float comparison
        return yTicks.some(tick => Math.abs(num - tick) < 0.01)
            ? `$${num.toFixed(2)}`
            : '';
    };

    // Loading State
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
                    Loading {stock.symbol} Stock Data...
                </Text>
                <Text className="text-gray-500 dark:text-gray-500 mt-2 text-sm">
                    Fetching real-time market data
                </Text>
            </View>
        );
    }

    // Error State
    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-6">
                <View className="bg-red-100 dark:bg-red-900 p-6 rounded-lg items-center">
                    <Text className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</Text>
                    <Text className="text-red-800 dark:text-red-200 text-lg font-semibold mb-2">
                        Oops! Something went wrong
                    </Text>
                    <Text className="text-red-700 dark:text-red-300 text-center mb-6">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={handleRetry}
                        className="bg-red-600 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-medium">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                        {companyInfo?.Name || stock.name}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mr-3">
                            ${stock.currentPrice.toFixed(2)}
                        </Text>
                        <View className={`px-3 py-1 rounded-full ${stock.changePercent >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                            <Text className={`font-medium ${stock.changePercent >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Company Information */}
                {companyInfo ? (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Company Information
                        </Text>

                        <View className="space-y-2 mb-4">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Sector</Text>
                                <Text className="text-gray-900 dark:text-white font-medium text-right w-32" numberOfLines={2}>
                                    {companyInfo.Sector}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Industry</Text>
                                <Text className="text-gray-900 dark:text-white font-medium text-right w-32" numberOfLines={2}>
                                    {companyInfo.Industry}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Exchange</Text>
                                <Text className="text-gray-900 dark:text-white font-medium text-right w-32">
                                    {companyInfo.Exchange}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Country</Text>
                                <Text className="text-gray-900 dark:text-white font-medium text-right w-32">
                                    {companyInfo.Country}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Address</Text>
                                <Text className="text-gray-900 dark:text-white font-medium text-right w-32" numberOfLines={3}>
                                    {companyInfo.Address}
                                </Text>
                            </View>
                        </View>

                        {companyInfo.OfficialSite && (
                            <TouchableOpacity
                                onPress={handleOpenWebsite}
                                className="border border-gray-300 dark:border-gray-600 p-2 rounded-md"
                            >
                                <Text className="text-gray-700 dark:text-gray-300 text-center text-sm">
                                    Visit Official Website
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 rounded-md">
                        <Text className="text-gray-700 text-base text-center">
                            No company information available for this stock.
                        </Text>
                    </View>
                )}

                {/* Chart */}
                <View className="p-4 bg-red-200">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                            Price Chart (30 Days)
                        </Text>
                        {chartData.length > 0 && (
                            <View className={`px-3 py-1 rounded-full ${chartData[chartData.length - 1]?.y >= chartData[0]?.y ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                <Text className={`text-xs font-medium ${chartData[chartData.length - 1]?.y >= chartData[0]?.y ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                    {chartData[chartData.length - 1]?.y >= chartData[0]?.y ? '↗ Trending Up' : '↘ Trending Down'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {chartLoading ? (
                        <View className="h-64 justify-center items-center">
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-600 dark:text-gray-400 mt-2">Loading chart data...</Text>
                        </View>
                    ) : chartData.length > 0 ? (
                        <>
                            <View className="h-64 flex items-center justify-center">
                                <LineChart
                                    data={{
                                        labels: xLabels,
                                        datasets: [{
                                            data: chartData.map(item => item.y),
                                            color: (opacity = 1) => stock.changePercent >= 0 ? `rgba(16, 185, 129, ${opacity})` : `rgba(239, 68, 68, ${opacity})`,
                                            strokeWidth: 3,
                                        }],
                                    }}
                                    width={screenWidth - 32}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                        backgroundGradientFrom: isDarkMode ? '#1F2937' : '#FFFFFF',
                                        backgroundGradientTo: isDarkMode ? '#1F2937' : '#FFFFFF',
                                        decimalPlaces: 4,
                                        color: (opacity = 1) => isDarkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
                                        labelColor: (opacity = 1) => isDarkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                            paddingRight: 5
                                        },
                                        propsForDots: {
                                            r: "1",
                                            strokeWidth: "2",
                                            stroke: `rgba(156, 163, 175, 1)`
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: '',
                                            stroke: isDarkMode ? '#374151' : '#E5E7EB',
                                            strokeWidth: 1,
                                        },
                                    }}
                                    formatYLabel={formatYLabel}
                                    formatXLabel={(value) => value}
                                    bezier
                                    style={{
                                        paddingLeft: 0,
                                        borderRadius: 16,
                                    }}
                                    withDots={true}
                                    withShadow={false}
                                    withInnerLines={false}
                                    withOuterLines={true}
                                    withVerticalLines={true}
                                    withHorizontalLines={true}
                                />
                            </View>
                            <View className="mt-4 flex-row justify-between items-center">
                                <View>
                                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                                        Start: {chartData[0]?.date}
                                    </Text>
                                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                                        End: {chartData[chartData.length - 1]?.date}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                                        Low: ${Math.min(...chartData.map(d => d.y)).toFixed(2)}
                                    </Text>
                                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                                        High: ${Math.max(...chartData.map(d => d.y)).toFixed(2)}
                                    </Text>
                                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                                        Current: ${chartData[chartData.length - 1]?.y.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View className="h-64 justify-center items-center">
                            <Text className="text-gray-600 dark:text-gray-400 text-lg">📊</Text>
                            <Text className="text-gray-600 dark:text-gray-400 mt-2">No chart data available</Text>
                        </View>
                    )}
                </View>

                {/* Price Statistics */}
                {chartData.length > 0 && (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Price Statistics (30 Days)
                        </Text>

                        <View className="space-y-3">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">30-Day High</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${Math.max(...chartData.map(d => d.y)).toFixed(2)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">30-Day Low</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${Math.min(...chartData.map(d => d.y)).toFixed(2)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">30-Day Range</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${(Math.max(...chartData.map(d => d.y)) - Math.min(...chartData.map(d => d.y))).toFixed(2)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">30-Day Change</Text>
                                <Text className={`font-medium ${chartData[chartData.length - 1]?.y >= chartData[0]?.y ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {chartData[chartData.length - 1]?.y >= chartData[0]?.y ? '+' : ''}
                                    ${(chartData[chartData.length - 1]?.y - chartData[0]?.y).toFixed(2)}
                                    ({(((chartData[chartData.length - 1]?.y - chartData[0]?.y) / chartData[0]?.y) * 100).toFixed(2)}%)
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">30-Day Average</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${(chartData.reduce((sum, d) => sum + d.y, 0) / chartData.length).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Financial Metrics */}
                {companyInfo && (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Financial Metrics
                        </Text>

                        <View className="space-y-3">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Market Cap</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    {formatCurrency(companyInfo.MarketCapitalization)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">P/E Ratio</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    {companyInfo.PERatio}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">EPS</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${companyInfo.EPS}
                                </Text>
                            </View>

                            {showAllFinancialMetrics && (
                                <>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Forward P/E</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {companyInfo.ForwardPE}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Dividend Yield</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {formatPercentage(companyInfo.DividendYield)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Dividend Per Share</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo.DividendPerShare}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Beta</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {companyInfo.Beta}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">52 Week High</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo["52WeekHigh"]}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">52 Week Low</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo["52WeekLow"]}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">50 Day MA</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo["50DayMovingAverage"]}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">200 Day MA</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo["200DayMovingAverage"]}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Book Value</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            ${companyInfo.BookValue}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Revenue TTM</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {formatCurrency(companyInfo.RevenueTTM)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">EBITDA</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {formatCurrency(companyInfo.EBITDA)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Profit Margin</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {formatPercentage(companyInfo.ProfitMargin)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Return on Equity</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {formatPercentage(companyInfo.ReturnOnEquityTTM)}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowAllFinancialMetrics(!showAllFinancialMetrics)}
                            className="mt-4 border border-gray-300 dark:border-gray-600 p-2 rounded-md"
                        >
                            <Text className="text-gray-700 dark:text-gray-300 text-center text-sm">
                                {showAllFinancialMetrics ? 'Show Less' : 'Show More Financial Metrics'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Analyst Ratings */}
                {companyInfo && (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Analyst Ratings
                        </Text>

                        <View className="space-y-3">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Target Price</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    ${companyInfo.AnalystTargetPrice}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Strong Buy</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    {companyInfo.AnalystRatingStrongBuy}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-gray-600 dark:text-gray-400">Buy</Text>
                                <Text className="text-gray-900 dark:text-white font-medium">
                                    {companyInfo.AnalystRatingBuy}
                                </Text>
                            </View>

                            {showAllAnalystRatings && (
                                <>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Hold</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {companyInfo.AnalystRatingHold}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Sell</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {companyInfo.AnalystRatingSell}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Strong Sell</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {companyInfo.AnalystRatingStrongSell}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 dark:text-gray-400">Total Analysts</Text>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            {parseInt(companyInfo.AnalystRatingStrongBuy) +
                                                parseInt(companyInfo.AnalystRatingBuy) +
                                                parseInt(companyInfo.AnalystRatingHold) +
                                                parseInt(companyInfo.AnalystRatingSell) +
                                                parseInt(companyInfo.AnalystRatingStrongSell)}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowAllAnalystRatings(!showAllAnalystRatings)}
                            className="mt-4 border border-gray-300 dark:border-gray-600 p-2 rounded-md"
                        >
                            <Text className="text-gray-700 dark:text-gray-300 text-center text-sm">
                                {showAllAnalystRatings ? 'Show Less' : 'Show More Analyst Ratings'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Company Description */}
                {companyInfo && (
                    <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            About {companyInfo.Name}
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 leading-6">
                            {companyInfo.Description}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Watchlist Selection Dropdown */}
            {showWatchlistDropdown && (
                <>
                    {/* Backdrop to handle outside clicks */}
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/25 z-10"
                        onPress={() => setShowWatchlistDropdown(false)}
                        activeOpacity={1}
                    />

                    <View className="absolute top-20 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 min-w-64 shadow-lg z-20">
                        <Text className="text-base font-bold text-gray-900 dark:text-white mb-2 text-center">
                            Select Watchlist
                        </Text>

                        <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
                            {watchlists.map((watchlist) => (
                                <TouchableOpacity
                                    key={watchlist.id}
                                    onPress={() => handleAddToWatchlist(watchlist)}
                                    className="p-3 rounded-md mb-2 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900"
                                >
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {watchlist.name}
                                            </Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                {watchlist.stocks.length} stocks
                                            </Text>
                                        </View>
                                        <View className="px-2 py-1 rounded-full bg-blue-500">
                                            <Text className="text-white font-medium text-xs">
                                                Add
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setShowWatchlistDropdown(false)}
                            className="mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md items-center"
                        >
                            <Text className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};