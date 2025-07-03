import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getStockChartData, fetchCompanyInfo } from '../services/stockService';
import { Stock, Watchlist, StockInfo, StockChartData } from '../types';
import {
  getWatchlists,
  addStockToWatchlist,
  removeStockFromWatchlist,
} from '../services/watchlistService';
import { ErrorState } from '../components/ErrorState';
import { formatPriceWithCurrency } from '../utils/timezoneUtils';
import {
  isValidValue,
  getSafeString,
  getSafeNumber,
  hasValidBasicInfo,
  hasValidFinancialMetrics,
  hasValidAnalystRatings,
  getTotalAnalystCount,
} from '../utils/dataValidationUtils';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';
// import { CartesianChart, Line } from "victory-native";

interface ProductScreenRouteParams {
  stock: Stock;
}

interface ChartDisplayData {
  x: number;
  y: number;
  date: string;
}

export const ProductScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { showErrorAlert, showSuccessAlert, showConfirmAlert, AlertComponent } =
    useCustomAlert();
  const { stock } = route.params as ProductScreenRouteParams;

  const [rawChartData, setRawChartData] = useState<StockChartData[]>([]);
  const [chartData, setChartData] = useState<ChartDisplayData[]>([]);
  const [companyInfo, setCompanyInfo] = useState<StockInfo | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllFinancialMetrics, setShowAllFinancialMetrics] = useState(false);
  const [showAllAnalystRatings, setShowAllAnalystRatings] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    date: string;
    price: number;
    index: number;
  } | null>(null);
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
        getStockChartData(stock.symbol, stock.region),
        fetchCompanyInfo(stock.symbol),
      ]);

      // Store raw chart data
      setRawChartData(chartDataResult);

      // Debug: Log the actual data range
      console.log('Chart data range:', {
        totalPoints: chartDataResult.length,
        firstDate: chartDataResult[0]?.date,
        lastDate: chartDataResult[chartDataResult.length - 1]?.date,
        allDates: chartDataResult.map(d => d.date),
      });

      // Format chart data for display - use ALL available data points
      const formattedData = chartDataResult.map((item, index) => ({
        x: index,
        y: item.price,
        date: item.date, // Trading dates are the same across all timezones
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
      showConfirmAlert(
        'No Watchlists',
        'You need to create a watchlist first. Would you like to create one?',
        () => navigation.navigate('Watchlist' as never),
        undefined,
        'Create',
        'Cancel'
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
        showSuccessAlert('Success', 'Stock removed from watchlist');
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
      showSuccessAlert('Success', `Stock added to ${watchlist.name}`);
      setShowWatchlistDropdown(false);
    } catch (error) {
      showErrorAlert('Error', 'Failed to add stock to watchlist');
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
    if (!isValidValue(value)) return 'N/A';

    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';

    if (num >= 1000000000) {
      return formatPriceWithCurrency(num / 1000000000, stock.currency) + 'B';
    } else if (num >= 1000000) {
      return formatPriceWithCurrency(num / 1000000, stock.currency) + 'M';
    } else if (num >= 1000) {
      return formatPriceWithCurrency(num / 1000, stock.currency) + 'K';
    } else {
      return formatPriceWithCurrency(num, stock.currency);
    }
  };

  const formatPercentage = (value: string) => {
    if (!isValidValue(value)) return 'N/A';

    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
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

  const handleChartTouch = (event: any) => {
    if (!chartData.length) return;

    // Get touch coordinates relative to chart
    const touchX = event.nativeEvent.locationX;
    const chartWidth = Math.max(screenWidth - 32, chartData.length * 30);

    // Calculate which data point was touched
    const dataPointWidth = chartWidth / chartData.length;
    const touchedIndex = Math.floor(touchX / dataPointWidth);

    // Ensure index is within bounds
    if (touchedIndex >= 0 && touchedIndex < chartData.length) {
      const dataPoint = chartData[touchedIndex];
      setSelectedDataPoint({
        date: dataPoint.date,
        price: dataPoint.y,
        index: touchedIndex,
      });
    }
  };

  // X-Axis: Show more date labels for better navigation with all data points
  const labelCount = Math.min(8, chartData.length); // Show up to 8 labels
  const labelIndexes: number[] = [];

  if (chartData.length <= 8) {
    // If we have 8 or fewer data points, show all
    for (let i = 0; i < chartData.length; i++) {
      labelIndexes.push(i);
    }
  } else {
    // Show start, end, and evenly spaced middle points
    labelIndexes.push(0); // Start
    for (let i = 1; i < labelCount - 1; i++) {
      labelIndexes.push(Math.floor((i * chartData.length) / (labelCount - 1)));
    }
    labelIndexes.push(chartData.length - 1); // End
  }

  const xLabels = chartData.map((item, index) =>
    labelIndexes.includes(index) ? item.date : ''
  );

  // Y-Axis: Show only a few price labels (min, max, median, or 3 spaced decimals if range is slight)
  const prices = chartData.map(item => item.y);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const medianPrice = prices.slice().sort((a, b) => a - b)[
    Math.floor(prices.length / 2)
  ];
  const priceRange = maxPrice - minPrice;

  let yTicks;
  if (priceRange < 0.05) {
    // If range is very slight, show 3 evenly spaced decimal values
    yTicks = [minPrice, minPrice + priceRange / 2, maxPrice];
  } else {
    yTicks = [minPrice, medianPrice, maxPrice];
  }

  const formatYLabel = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : formatPriceWithCurrency(num, stock.currency);
  };

  // Loading State
  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-lg" style={{ color: colors.textSecondary }}>
          Loading {stock.symbol} Stock Data...
        </Text>
        <Text className="mt-2 text-sm" style={{ color: colors.textTertiary }}>
          Fetching real-time market data
        </Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <ErrorState
        title="Unable to Load Stock Data"
        message="We encountered an issue while loading the stock information. Please check your connection and try again."
        onRetry={handleRetry}
        icon="📈"
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <AlertComponent />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="p-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {stock.symbol}
            </Text>
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              className="px-6 py-3 rounded-full shadow-lg"
              style={{
                backgroundColor: isInWatchlist ? colors.error : colors.primary,
                shadowColor: isInWatchlist ? colors.error : colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: colors.primaryText }}
              >
                {isInWatchlist ? 'Remove' : 'Add to Watchlist'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            className="text-lg mb-2"
            style={{ color: colors.textSecondary }}
          >
            {companyInfo?.Name || stock.name}
          </Text>
          <View className="flex-row items-center">
            <Text
              className="text-3xl font-bold mr-3"
              style={{ color: colors.text }}
            >
              {(() => {
                // Use chart data price if available, otherwise fall back to stock price
                const currentPrice =
                  rawChartData.length > 0
                    ? rawChartData[rawChartData.length - 1]?.price
                    : stock.currentPrice;
                return formatPriceWithCurrency(
                  currentPrice || 0,
                  stock.currency
                );
              })()}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: (() => {
                  // Calculate change percent from chart data if available
                  if (rawChartData.length >= 2) {
                    const currentPrice =
                      rawChartData[rawChartData.length - 1]?.price;
                    const previousPrice =
                      rawChartData[rawChartData.length - 2]?.price;
                    if (currentPrice && previousPrice && previousPrice > 0) {
                      const changePercent =
                        ((currentPrice - previousPrice) / previousPrice) * 100;
                      return changePercent >= 0
                        ? colors.success + '20'
                        : colors.error + '20';
                    }
                  }
                  return stock.changePercent >= 0
                    ? colors.success + '20'
                    : colors.error + '20';
                })(),
              }}
            >
              <Text
                className="font-medium"
                style={{
                  color: (() => {
                    // Calculate change percent from chart data if available
                    if (rawChartData.length >= 2) {
                      const currentPrice =
                        rawChartData[rawChartData.length - 1]?.price;
                      const previousPrice =
                        rawChartData[rawChartData.length - 2]?.price;
                      if (currentPrice && previousPrice && previousPrice > 0) {
                        const changePercent =
                          ((currentPrice - previousPrice) / previousPrice) *
                          100;
                        return changePercent >= 0
                          ? colors.success
                          : colors.error;
                      }
                    }
                    return stock.changePercent >= 0
                      ? colors.success
                      : colors.error;
                  })(),
                }}
              >
                {(() => {
                  // Calculate change percent from chart data if available
                  if (rawChartData.length >= 2) {
                    const currentPrice =
                      rawChartData[rawChartData.length - 1]?.price;
                    const previousPrice =
                      rawChartData[rawChartData.length - 2]?.price;
                    if (currentPrice && previousPrice && previousPrice > 0) {
                      const changePercent =
                        ((currentPrice - previousPrice) / previousPrice) * 100;
                      return `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                    }
                  }
                  return `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`;
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        {companyInfo && hasValidBasicInfo(companyInfo) ? (
          <View
            className="p-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-lg font-semibold mb-3"
              style={{ color: colors.text }}
            >
              Company Information
            </Text>

            <View className="space-y-2 mb-4">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Sector</Text>
                <Text
                  className="font-medium text-right w-32"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {getSafeString(companyInfo.Sector)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Industry</Text>
                <Text
                  className="font-medium text-right w-32"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {getSafeString(companyInfo.Industry)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Exchange</Text>
                <Text
                  className="font-medium text-right w-32"
                  style={{ color: colors.text }}
                >
                  {getSafeString(companyInfo.Exchange)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Country</Text>
                <Text
                  className="font-medium text-right w-32"
                  style={{ color: colors.text }}
                >
                  {getSafeString(companyInfo.Country)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Address</Text>
                <Text
                  className="font-medium text-right w-32"
                  style={{ color: colors.text }}
                  numberOfLines={3}
                >
                  {getSafeString(companyInfo.Address)}
                </Text>
              </View>
            </View>

            {isValidValue(companyInfo.OfficialSite) && (
              <TouchableOpacity
                onPress={handleOpenWebsite}
                className="border p-2 rounded-lg"
                style={{
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-center text-sm"
                  style={{ color: colors.text }}
                >
                  Visit Official Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View
            className="p-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="items-center justify-center py-6">
              <Text
                className="text-sm font-medium mb-1"
                style={{ color: colors.textSecondary }}
              >
                Company Information
              </Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>
                Not available for this stock
              </Text>
            </View>
          </View>
        )}

        {/* Market Information - Show for all stocks with appropriate data */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 12,
              color: colors.text,
            }}
          >
            Market Information
          </Text>

          <View className="space-y-2">
            {/* Exchange - Only show if available in company info */}
            {companyInfo?.Exchange && (
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Exchange:</Text>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {companyInfo.Exchange}
                </Text>
              </View>
            )}

            {/* Region - Use search API data or hardcoded US value */}
            <View className="flex-row justify-between">
              <Text style={{ color: colors.textSecondary }}>Region:</Text>
              <Text className="font-medium" style={{ color: colors.text }}>
                {stock.region || 'United States'}
              </Text>
            </View>

            {/* Market Hours - Use search API data or hardcoded US value */}
            <View className="flex-row justify-between">
              <Text style={{ color: colors.textSecondary }}>Market Hours:</Text>
              <Text className="font-medium" style={{ color: colors.text }}>
                {stock.marketOpen && stock.marketClose && stock.timezone
                  ? `${stock.marketOpen} - ${stock.marketClose} (${stock.timezone})`
                  : '09:30 - 16:00 (Eastern)'}
              </Text>
            </View>

            {/* Currency - Use search API data or hardcoded US value */}
            <View className="flex-row justify-between">
              <Text style={{ color: colors.textSecondary }}>Currency:</Text>
              <Text className="font-medium" style={{ color: colors.text }}>
                {stock.currency || 'USD'}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View className="p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Price Chart
            </Text>
            <View className="flex-row items-center">
              {rawChartData.length > 0 && (
                <View
                  className="px-3 py-1 rounded-full mr-3"
                  style={{
                    backgroundColor:
                      rawChartData[rawChartData.length - 1]?.price >=
                      rawChartData[0]?.price
                        ? colors.success + '20'
                        : colors.error + '20',
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{
                      color:
                        rawChartData[rawChartData.length - 1]?.price >=
                        rawChartData[0]?.price
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    {rawChartData[rawChartData.length - 1]?.price >=
                    rawChartData[0]?.price
                      ? '↗ Trending Up'
                      : '↘ Trending Down'}
                  </Text>
                </View>
              )}
              {stock.region && (
                <View
                  className="px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    {stock.region}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {chartLoading ? (
            <View className="h-64 justify-center items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-2" style={{ color: colors.textSecondary }}>
                Loading chart data...
              </Text>
            </View>
          ) : chartData.length > 0 ? (
            <>
              <View className="relative">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  style={{ height: 256 }}
                  onTouchEnd={handleChartTouch}
                >
                  <LineChart
                    data={{
                      labels: xLabels,
                      datasets: [
                        {
                          data: chartData.map(item => item.y),
                          color: (opacity = 1) =>
                            rawChartData[rawChartData.length - 1]?.price >=
                            rawChartData[0]?.price
                              ? `rgba(16, 185, 129, ${opacity})`
                              : `rgba(239, 68, 68, ${opacity})`,
                          strokeWidth: 3,
                        },
                      ],
                    }}
                    width={Math.max(screenWidth - 32, chartData.length * 30)}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.surface,
                      backgroundGradientFrom: colors.surface,
                      backgroundGradientTo: colors.surface,
                      decimalPlaces: 4,
                      color: (opacity = 1) =>
                        `rgba(${colors.text === '#000000' ? '75, 85, 99' : '156, 163, 175'}, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(${colors.text === '#000000' ? '75, 85, 99' : '156, 163, 175'}, ${opacity})`,
                      style: {
                        borderRadius: 16,
                        // paddingRight: 20,
                        // paddingLeft: 10
                      },
                      propsForDots: {
                        r: '2',
                        strokeWidth: '2',
                        stroke: colors.textSecondary,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: colors.borderSecondary,
                        strokeWidth: 1,
                      },
                    }}
                    formatYLabel={formatYLabel}
                    formatXLabel={value => value}
                    bezier
                    style={{
                      borderRadius: 16,
                    }}
                    withDots={true}
                    withShadow={false}
                    withInnerLines={false}
                    withOuterLines={true}
                    withVerticalLines={true}
                    withHorizontalLines={true}
                  />
                </ScrollView>

                {/* Selected Data Point Display */}
                {selectedDataPoint && (
                  <View
                    className="mt-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary + '40',
                    }}
                  >
                    <Text
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.primary }}
                    >
                      Selected Data Point
                    </Text>
                    <View className="flex-row justify-between">
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        Date: {selectedDataPoint.date}
                      </Text>
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: colors.primary }}
                      >
                        Price:{' '}
                        {formatPriceWithCurrency(
                          selectedDataPoint.price,
                          stock.currency
                        )}
                      </Text>
                    </View>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.textTertiary }}
                    >
                      Tap anywhere on the chart to select a different point
                    </Text>
                  </View>
                )}

                <View className="mt-4 flex-row justify-between items-center">
                  <View>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Start: {chartData[0]?.date}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      End: {chartData[chartData.length - 1]?.date}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Low:{' '}
                      {formatPriceWithCurrency(
                        Math.min(...chartData.map(d => d.y)),
                        stock.currency
                      )}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      High:{' '}
                      {formatPriceWithCurrency(
                        Math.max(...chartData.map(d => d.y)),
                        stock.currency
                      )}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Current:{' '}
                      {formatPriceWithCurrency(
                        chartData[chartData.length - 1]?.y,
                        stock.currency
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View className="h-64 justify-center items-center">
              <Ionicons
                name="trending-up"
                size={48}
                color={colors.textSecondary}
              />
              <Text className="mt-2" style={{ color: colors.textSecondary }}>
                No chart data available
              </Text>
            </View>
          )}
        </View>

        {/* Price Statistics */}
        {chartData.length > 0 && (
          <View
            className="p-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Price Statistics
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>High</Text>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {formatPriceWithCurrency(
                    Math.max(...chartData.map(d => d.y)),
                    stock.currency
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Low</Text>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {formatPriceWithCurrency(
                    Math.min(...chartData.map(d => d.y)),
                    stock.currency
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Range</Text>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {formatPriceWithCurrency(
                    Math.max(...chartData.map(d => d.y)) -
                      Math.min(...chartData.map(d => d.y)),
                    stock.currency
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Change</Text>
                <Text
                  className="font-medium"
                  style={{
                    color:
                      chartData[chartData.length - 1]?.y >= chartData[0]?.y
                        ? colors.success
                        : colors.error,
                  }}
                >
                  {chartData[chartData.length - 1]?.y >= chartData[0]?.y
                    ? '+'
                    : ''}
                  {formatPriceWithCurrency(
                    chartData[chartData.length - 1]?.y - chartData[0]?.y,
                    stock.currency
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Average</Text>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {formatPriceWithCurrency(
                    chartData.reduce((sum, d) => sum + d.y, 0) /
                      chartData.length,
                    stock.currency
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Financial Metrics */}
        {companyInfo && hasValidFinancialMetrics(companyInfo) ? (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Financial Metrics
            </Text>

            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Market Cap</Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {isValidValue(companyInfo.MarketCapitalization)
                    ? formatCurrency(companyInfo.MarketCapitalization)
                    : 'N/A'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>P/E Ratio</Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {getSafeString(companyInfo.PERatio)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>EPS</Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {isValidValue(companyInfo.EPS)
                    ? formatPriceWithCurrency(
                        getSafeNumber(companyInfo.EPS),
                        stock.currency
                      )
                    : 'N/A'}
                </Text>
              </View>

              {showAllFinancialMetrics && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Forward P/E
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getSafeString(companyInfo.ForwardPE)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Dividend Yield
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.DividendYield)
                        ? formatPercentage(companyInfo.DividendYield)
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Dividend Per Share
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.DividendPerShare)
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo.DividendPerShare),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>Beta</Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getSafeString(companyInfo.Beta)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      52 Week High
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo['52WeekHigh'])
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo['52WeekHigh']),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      52 Week Low
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo['52WeekLow'])
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo['52WeekLow']),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      50 Day MA
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo['50DayMovingAverage'])
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo['50DayMovingAverage']),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      200 Day MA
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo['200DayMovingAverage'])
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo['200DayMovingAverage']),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Book Value
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.BookValue)
                        ? formatPriceWithCurrency(
                            getSafeNumber(companyInfo.BookValue),
                            stock.currency
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Revenue TTM
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.RevenueTTM)
                        ? formatCurrency(companyInfo.RevenueTTM)
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>EBITDA</Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.EBITDA)
                        ? formatCurrency(companyInfo.EBITDA)
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Profit Margin
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.ProfitMargin)
                        ? formatPercentage(companyInfo.ProfitMargin)
                        : 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Return on Equity
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {isValidValue(companyInfo.ReturnOnEquityTTM)
                        ? formatPercentage(companyInfo.ReturnOnEquityTTM)
                        : 'N/A'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              onPress={() =>
                setShowAllFinancialMetrics(!showAllFinancialMetrics)
              }
              style={{
                marginTop: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 8,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              >
                {showAllFinancialMetrics
                  ? 'Show Less'
                  : 'Show More Financial Metrics'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          companyInfo && (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 24,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '500',
                    marginBottom: 4,
                  }}
                >
                  Financial Metrics
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                  Not available for this stock
                </Text>
              </View>
            </View>
          )
        )}

        {/* Analyst Ratings */}
        {companyInfo && hasValidAnalystRatings(companyInfo) ? (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Analyst Ratings
            </Text>

            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Target Price
                </Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {isValidValue(companyInfo.AnalystTargetPrice)
                    ? formatPriceWithCurrency(
                        getSafeNumber(companyInfo.AnalystTargetPrice),
                        stock.currency
                      )
                    : 'N/A'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Strong Buy</Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {getSafeString(companyInfo.AnalystRatingStrongBuy)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Buy</Text>
                <Text style={{ color: colors.text, fontWeight: '500' }}>
                  {getSafeString(companyInfo.AnalystRatingBuy)}
                </Text>
              </View>

              {showAllAnalystRatings && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>Hold</Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getSafeString(companyInfo.AnalystRatingHold)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>Sell</Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getSafeString(companyInfo.AnalystRatingSell)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Strong Sell
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getSafeString(companyInfo.AnalystRatingStrongSell)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Total Analysts
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '500' }}>
                      {getTotalAnalystCount(companyInfo)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowAllAnalystRatings(!showAllAnalystRatings)}
              style={{
                marginTop: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 8,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              >
                {showAllAnalystRatings
                  ? 'Show Less'
                  : 'Show More Analyst Ratings'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          companyInfo && (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 24,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '500',
                    marginBottom: 4,
                  }}
                >
                  Analyst Ratings
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                  Not available for this stock
                </Text>
              </View>
            </View>
          )
        )}

        {/* Company Description */}
        {companyInfo && isValidValue(companyInfo.Description) && (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}
            >
              About {getSafeString(companyInfo.Name, 'Company')}
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
              {getSafeString(companyInfo.Description)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Watchlist Selection Dropdown */}
      {showWatchlistDropdown && (
        <>
          {/* Backdrop to handle outside clicks */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              zIndex: 10,
            }}
            onPress={() => setShowWatchlistDropdown(false)}
            activeOpacity={1}
          />

          <View
            style={{
              position: 'absolute',
              top: 80,
              right: 16,
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 12,
              minWidth: 256,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Select Watchlist
            </Text>

            <ScrollView
              style={{ maxHeight: 192 }}
              showsVerticalScrollIndicator={false}
            >
              {watchlists.map(watchlist => (
                <TouchableOpacity
                  key={watchlist.id}
                  onPress={() => handleAddToWatchlist(watchlist)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                      >
                        {watchlist.name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        {watchlist.stocks.length} stocks
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 25,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primaryText,
                          fontWeight: '500',
                          fontSize: 12,
                        }}
                      >
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
                borderColor: colors.border,
                borderRadius: 6,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontWeight: '500',
                  fontSize: 12,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
